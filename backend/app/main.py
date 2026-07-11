import asyncio
import json
import threading
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from backend.app.database import engine, Base
from backend.app.routers import auth, simulation, models, analytics
from backend.app.services.llm_service import llm_service

# Initialize tables (Automatic SQLite setup)
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Database table creation failed: {e}")

app = FastAPI(
    title="LLM INSIDE API",
    description="Interactive LLM Working Simulator Backend",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(simulation.router)
app.include_router(models.router)
app.include_router(analytics.router)

# Asynchronously load HuggingFace model in background thread to avoid blocking server start
def load_llm_model_background():
    llm_service.load_model()

@app.on_event("startup")
def startup_event():
    # Start loading the model in a background thread
    threading.Thread(target=load_llm_model_background, daemon=True).start()

@app.get("/")
def read_root():
    return {"message": "Welcome to LLM INSIDE API. Simulator is ready.", "model_loaded": llm_service.is_loaded}

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

manager = ConnectionManager()

@app.websocket("/ws/simulation")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Receive input from client
            data = await websocket.receive_text()
            payload = json.loads(data)
            
            prompt = payload.get("prompt", "")
            params = payload.get("parameters", {})
            
            if not prompt:
                await websocket.send_text(json.dumps({"error": "Prompt is empty"}))
                continue
                
            # Perform full simulation run to extract weights & stages
            sim_result = llm_service.run_simulation(prompt, params)
            
            # Stages mapping (1 to 12)
            stages = [
                {"stage": 1, "name": "Input Processing", "data": {"text": sim_result["text"], "char_count": sim_result["char_count"], "word_count": sim_result["word_count"]}},
                {"stage": 2, "name": "Cleaning & Normalization", "data": {"cleaned": sim_result["text"].lower().strip()}},
                {"stage": 3, "name": "Tokenization", "data": {"tokens": sim_result["tokens"], "method": params.get("tokenization_method", "BPE")}},
                {"stage": 4, "name": "Token IDs", "data": {"token_ids": sim_result["token_ids"], "vocabulary_sample": [{"id": tid, "token": t["text"]} for tid, t in zip(sim_result["token_ids"], sim_result["tokens"])]}},
                {"stage": 5, "name": "Embeddings Projection", "data": {"embeddings_slice": [e[:5] for e in sim_result["embeddings"][:5]], "pca_coords": sim_result["pca_coords"]}},
                {"stage": 6, "name": "Positional Encoding", "data": {"encoding_slice": [pe[:5] for pe in sim_result["positional_encoding"][:5]], "mode": params.get("positional_encoding", "Sinusoidal")}},
                {"stage": 7, "name": "Transformer Blocks Flow", "data": {"num_layers": sim_result["num_layers"]}},
                {"stage": 8, "name": "Self Attention Weights", "data": {"attention_heads": sim_result["attention_heads"], "tokens": [t["text"] for t in sim_result["tokens"]]}},
                {"stage": 9, "name": "Feed Forward Networks", "data": sim_result["feed_forward"]},
                {"stage": 10, "name": "Hidden States Outputs", "data": {"states_slice": [hs[:5] for hs in sim_result["hidden_states"][:5]]}},
                {"stage": 11, "name": "Next Token Prediction", "data": {"probabilities": sim_result["next_token_probs"]}},
                {"stage": 12, "name": "Output Generation", "data": {"generated_text": sim_result["generated_text"]}}
            ]
            
            # Stream each stage to the frontend one by one to show dynamic execution
            for idx, stage in enumerate(stages):
                await websocket.send_text(json.dumps({
                    "type": "stage_update",
                    "current_stage": stage["stage"],
                    "total_stages": len(stages),
                    "stage_name": stage["name"],
                    "data": stage["data"]
                }))
                # Sleep a short duration to let frontend animate the transitions
                await asyncio.sleep(0.6)
                
            await websocket.send_text(json.dumps({
                "type": "simulation_complete",
                "full_result": {
                    "prompt": prompt,
                    "generated_text": sim_result["generated_text"],
                    "estimated_cost_usd": sim_result["estimated_cost_usd"]
                }
            }))
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket Error: {e}")
        try:
            await websocket.send_text(json.dumps({"error": str(e)}))
        except:
            pass
        manager.disconnect(websocket)
