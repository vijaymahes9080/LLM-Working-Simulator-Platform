from fastapi import APIRouter, Depends, HTTPException, status, Header
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import json
import io

from backend.app.database import get_db
from backend.app.models.session import SimulationSession
from backend.app.models.analytics import AnalyticsLog
from backend.app.services.llm_service import llm_service
from backend.app.services.auth_service import decode_access_token
from backend.app.services.export_service import export_service

router = APIRouter(prefix="/simulate", tags=["simulation"])

class SimulationRequestSchema(BaseModel):
    prompt: str
    model_name: str = "distilgpt2"
    temperature: float = 0.7
    top_p: float = 0.9
    top_k: int = 50
    tokenization_method: str = "BPE" # BPE, WordPiece, SentencePiece
    positional_encoding: str = "Sinusoidal" # Sinusoidal, Rotary
    num_layers: int = 6
    token_limit: int = 15

def get_current_user_id(authorization: Optional[str] = Header(None)) -> Optional[int]:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        return None
    return payload.get("id")

@router.post("/run")
def run_simulation(
    req: SimulationRequestSchema,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id)
):
    if not req.prompt:
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")
        
    start_time = len(req.prompt) * 0.1 # simulated timing base
    # Run core simulation
    sim_params = {
        "temperature": req.temperature,
        "top_p": req.top_p,
        "top_k": req.top_k,
        "tokenization_method": req.tokenization_method,
        "positional_encoding": req.positional_encoding,
        "num_layers": req.num_layers,
        "token_limit": req.token_limit
    }
    
    import time
    t0 = time.time()
    result = llm_service.run_simulation(req.prompt, sim_params)
    execution_time = (time.time() - t0) * 1000 # ms
    
    # Store session in DB if user is authenticated (not guest/anonymous)
    session_id = None
    if user_id:
        db_session = SimulationSession(
            user_id=user_id,
            prompt=req.prompt,
            model_name=req.model_name,
            parameters=json.dumps(sim_params),
            output_text=result["generated_text"]
        )
        db.add(db_session)
        db.commit()
        db.refresh(db_session)
        session_id = db_session.id
        
        # Log analytics
        log = AnalyticsLog(
            user_id=user_id,
            session_id=session_id,
            tokens_generated=len(result["tokens"]) + len(result["next_token_probs"]),
            execution_time_ms=execution_time
        )
        db.add(log)
        db.commit()
        
    return {
        "session_id": session_id,
        "execution_time_ms": execution_time,
        "simulation": result
    }

@router.get("/sessions")
def get_sessions(
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id)
):
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required to view history")
    
    sessions = db.query(SimulationSession).filter(SimulationSession.user_id == user_id).order_by(SimulationSession.created_at.desc()).all()
    return [
        {
            "id": s.id,
            "prompt": s.prompt,
            "model_name": s.model_name,
            "parameters": json.loads(s.parameters),
            "output_text": s.output_text,
            "created_at": s.created_at.isoformat()
        }
        for s in sessions
    ]

@router.post("/export/{format}")
def export_session(
    format: str,
    data: Dict[str, Any]
):
    if format == "json":
        json_data = export_service.export_json(data)
        return StreamingResponse(
            io.BytesIO(json_data.encode("utf-8")),
            media_type="application/json",
            headers={"Content-Disposition": "attachment; filename=simulation_export.json"}
        )
    elif format == "pdf":
        pdf_buffer = export_service.export_pdf(data)
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=simulation_export.pdf"}
        )
    else:
        raise HTTPException(status_code=400, detail="Invalid export format. Choose 'json' or 'pdf'")

class VectorMathRequestSchema(BaseModel):
    word_a: str
    op1: str
    word_b: str
    op2: str
    word_c: str

@router.post("/vector-math")
def vector_math_algebra(req: VectorMathRequestSchema):
    if not req.word_a or not req.word_b or not req.word_c:
        raise HTTPException(status_code=400, detail="All words in the equation must be provided")
    if req.op1 not in ["+", "-"] or req.op2 not in ["+", "-"]:
        raise HTTPException(status_code=400, detail="Operators must be either '+' or '-'")
    
    try:
        result = llm_service.run_vector_math(req.word_a, req.op1, req.word_b, req.op2, req.word_c)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

