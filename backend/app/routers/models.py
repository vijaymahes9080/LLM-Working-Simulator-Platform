from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter(prefix="/models", tags=["models"])

SUPPORTED_MODELS = [
    {
        "id": "gpt2",
        "name": "GPT-2 (117M params)",
        "type": "Causal LM",
        "tokenizer": "BPE",
        "layers": 12,
        "heads": 12,
        "description": "Standard Generative Pre-trained Transformer 2 model released by OpenAI.",
        "speed": "Fast (CPU friendly)"
    },
    {
        "id": "distilgpt2",
        "name": "DistilGPT-2 (82M params)",
        "type": "Causal LM",
        "tokenizer": "BPE",
        "layers": 6,
        "heads": 8,
        "description": "Distilled, smaller and faster version of GPT-2.",
        "speed": "Ultra Fast"
    },
    {
        "id": "bert-base",
        "name": "BERT-Base",
        "type": "Masked LM / Encoder",
        "tokenizer": "WordPiece",
        "layers": 12,
        "heads": 12,
        "description": "Bidirectional Encoder Representations from Transformers by Google.",
        "speed": "Medium"
    },
    {
        "id": "llama-tiny-sim",
        "name": "Llama 3 (Simulated)",
        "type": "Causal LM",
        "tokenizer": "SentencePiece",
        "layers": 32,
        "heads": 32,
        "description": "Simulated view of Meta's Llama 3 architectures.",
        "speed": "Simulated Instant"
    }
]

@router.get("/list")
def list_models() -> List[Dict[str, Any]]:
    return SUPPORTED_MODELS

@router.get("/compare")
def compare_models(model_a: str, model_b: str) -> Dict[str, Any]:
    # Provide visual comparison statistics
    specs = {m["id"]: m for m in SUPPORTED_MODELS}
    
    a_spec = specs.get(model_a, SUPPORTED_MODELS[0])
    b_spec = specs.get(model_b, SUPPORTED_MODELS[1])
    
    return {
        "model_a": a_spec,
        "model_b": b_spec,
        "comparison_metrics": {
            "parameter_ratio": "1.4x" if model_a == "gpt2" and model_b == "distilgpt2" else "Custom",
            "tokenizer_difference": f"{a_spec['tokenizer']} vs {b_spec['tokenizer']}",
            "attention_heads": f"{a_spec['heads']} vs {b_spec['heads']}",
            "layers": f"{a_spec['layers']} vs {b_spec['layers']}"
        }
    }
