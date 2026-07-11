from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

from backend.app.database import get_db
from backend.app.models.analytics import AnalyticsLog
from backend.app.models.session import SimulationSession
from backend.app.models.user import User
from backend.app.services.auth_service import decode_access_token

router = APIRouter(prefix="/analytics", tags=["analytics"])

def get_admin_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication token missing")
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(User).filter(User.id == payload.get("id")).first()
    if not user or user.role != "admin":
        # For simplicity in testing/dev, if there is no admin user yet, we will allow it or check if it's the first user.
        # But let's check role.
        raise HTTPException(status_code=403, detail="Admin permissions required")
    return user

@router.get("/dashboard")
def get_dashboard_analytics(db: Session = Depends(get_db)):
    # Total stats
    total_users = db.query(User).count()
    total_sessions = db.query(SimulationSession).count()
    
    # Calculate total generated tokens (summed from logs)
    total_tokens = db.query(func.sum(AnalyticsLog.tokens_generated)).scalar() or 0
    avg_latency = db.query(func.avg(AnalyticsLog.execution_time_ms)).scalar() or 0.0
    
    # Daily sessions for the last 7 days
    history = []
    today = datetime.utcnow().date()
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        count = db.query(SimulationSession).filter(
            func.date(SimulationSession.created_at) == day
        ).count()
        history.append({
            "date": day.strftime("%Y-%m-%d"),
            "sessions": count
        })
        
    # Get top active prompts/sessions
    recent_sessions = db.query(SimulationSession).order_by(SimulationSession.created_at.desc()).limit(5).all()
    recent = [
        {
            "id": s.id,
            "prompt": s.prompt[:50] + "..." if len(s.prompt) > 50 else s.prompt,
            "model": s.model_name,
            "created_at": s.created_at.isoformat()
        } for s in recent_sessions
    ]
    
    return {
        "total_users": total_users,
        "total_sessions": total_sessions,
        "total_tokens_simulated": int(total_tokens),
        "average_latency_ms": round(float(avg_latency), 2),
        "sessions_history_7d": history,
        "recent_simulations": recent
    }

@router.get("/admin/users")
def get_users_list(db: Session = Depends(get_db), current_admin: User = Depends(get_admin_user)):
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "role": u.role,
            "created_at": u.created_at.isoformat()
        }
        for u in users
    ]
