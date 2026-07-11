import os
import time
import math
import numpy as np
from typing import Dict, Any, List, Tuple, Optional

# We will try to import torch and transformers, but fall back gracefully if not fully installed yet.
try:
    import torch
    from transformers import AutoTokenizer, AutoModelForCausalLM
    HAS_TRANSFORMERS = True
except ImportError:
    HAS_TRANSFORMERS = False

# Fallback/Mock LLM Engine for offline use or low memory
class MockLLM:
    def __init__(self):
        self.vocab = ["the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me"]
        self.vocab_dict = {word: 100 + i for i, word in enumerate(self.vocab)}
    
    def tokenize(self, text: str, method: str = "BPE") -> List[Dict[str, Any]]:
        words = text.split()
        tokens = []
        char_idx = 0
        for i, word in enumerate(words):
            # Clean punctuation for simulation representation
            clean_word = word.strip(".,!?\"'()[]{}")
            token_id = self.vocab_dict.get(clean_word.lower(), 500 + hash(clean_word) % 9500)
            
            # Simple splits for wordpieces/subwords simulation
            sub_tokens = []
            if method == "BPE" and len(clean_word) > 7:
                mid = len(clean_word) // 2
                part1 = clean_word[:mid]
                part2 = clean_word[mid:]
                sub_tokens.append((part1, token_id - 5))
                sub_tokens.append(("##" + part2, token_id + 5))
            elif method == "WordPiece" and len(clean_word) > 6:
                mid = len(clean_word) // 2
                sub_tokens.append((clean_word[:mid], token_id - 3))
                sub_tokens.append(("##" + clean_word[mid:], token_id + 3))
            elif method == "SentencePiece":
                sub_tokens.append(("\u2581" + clean_word, token_id))
            else:
                sub_tokens.append((word, token_id))
                
            for sub_text, sub_id in sub_tokens:
                start = text.find(sub_text.replace("\u2581", "").replace("##", ""), char_idx)
                if start == -1:
                    start = char_idx
                end = start + len(sub_text.replace("\u2581", "").replace("##", ""))
                tokens.append({
                    "text": sub_text,
                    "id": sub_id,
                    "start": start,
                    "end": end
                })
                char_idx = end
        return tokens

    def get_embeddings(self, tokens: List[Dict[str, Any]], d_model: int = 128) -> Tuple[np.ndarray, np.ndarray]:
        # Generate stable embeddings using token ID as a seed
        seq_len = len(tokens)
        embeddings = np.zeros((seq_len, d_model))
        for i, t in enumerate(tokens):
            np.random.seed(t["id"])
            embeddings[i] = np.random.randn(d_model) * 0.1
            
        # PCA projection to 3D for visualization
        if seq_len > 3:
            # simple mock PCA: just take first 3 dimensions or apply standard projection matrix
            np.random.seed(42)
            proj_matrix = np.random.randn(d_model, 3)
            pca_coords = np.dot(embeddings, proj_matrix)
        else:
            pca_coords = np.zeros((seq_len, 3))
            for i in range(seq_len):
                pca_coords[i, 0] = math.sin(i)
                pca_coords[i, 1] = math.cos(i)
                pca_coords[i, 2] = i * 0.5
        
        return embeddings, pca_coords

    def get_positional_encoding(self, seq_len: int, d_model: int = 128, mode: str = "Sinusoidal") -> np.ndarray:
        pe = np.zeros((seq_len, d_model))
        for pos in range(seq_len):
            for i in range(0, d_model, 2):
                if mode == "Sinusoidal":
                    pe[pos, i] = math.sin(pos / (10000 ** (i / d_model)))
                    if i + 1 < d_model:
                        pe[pos, i + 1] = math.cos(pos / (10000 ** (i / d_model)))
                else: # Rotary / RoPE simulation
                    angle = pos / (100 ** (i / d_model))
                    pe[pos, i] = math.sin(angle)
                    if i + 1 < d_model:
                        pe[pos, i + 1] = math.cos(angle)
        return pe

    def get_attention_weights(self, seq_len: int, num_heads: int = 4) -> np.ndarray:
        # Generate mock self-attention weights [num_heads, seq_len, seq_len]
        attn = np.zeros((num_heads, seq_len, seq_len))
        for h in range(num_heads):
            for i in range(seq_len):
                np.random.seed(h * 100 + i)
                weights = np.random.rand(seq_len)
                # Lower triangular for causal masking or bidirectional
                weights = np.exp(weights)
                attn[h, i] = weights / np.sum(weights)
        return attn

    def get_feed_forward(self, embedding: np.ndarray) -> Dict[str, Any]:
        # Expand, Activate (GELU), Compress
        seq_len, d_model = embedding.shape
        d_ff = d_model * 4
        
        # Simulating active neurons (we only show first few for visual clarity)
        neurons_active = []
        for i in range(min(seq_len, 5)):
            np.random.seed(i)
            # active neurons in FF layer
            act = np.random.rand(10)
            neurons_active.append(act.tolist())
            
        return {
            "ff_in_dim": d_model,
            "ff_hidden_dim": d_ff,
            "neurons_active": neurons_active
        }

    def get_next_token_probs(self, tokens: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        # Predict realistic next tokens
        candidates = ["is", "are", "works", "was", "development", "architecture", "model", "system", "learning", "data", "processing", "inside", "platform", "code"]
        probs = []
        np.random.seed(int(time.time()) % 1000)
        selected_indices = np.random.choice(len(candidates), size=5, replace=False)
        raw_scores = np.random.rand(5) * 10
        exp_scores = np.exp(raw_scores - np.max(raw_scores))
        softmax_probs = exp_scores / np.sum(exp_scores)
        
        for idx, prob in zip(selected_indices, softmax_probs):
            probs.append({
                "token": candidates[idx],
                "id": 1000 + idx,
                "probability": round(float(prob) * 100, 2)
            })
        
        # Sort descending
        probs.sort(key=lambda x: x["probability"], reverse=True)
        return probs

class LLMService:
    def __init__(self):
        self.mock_engine = MockLLM()
        self.model_name = "distilgpt2"
        self.tokenizer = None
        self.model = None
        self.is_loaded = False
        
    def load_model(self):
        if not HAS_TRANSFORMERS:
            print("Transformers not installed. Running in simulation mode.")
            return False
        
        try:
            print(f"Loading {self.model_name} model and tokenizer...")
            start_time = time.time()
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model = AutoModelForCausalLM.from_pretrained(self.model_name, output_attentions=True, output_hidden_states=True)
            self.model.eval()
            self.is_loaded = True
            print(f"Model loaded successfully in {time.time() - start_time:.2f}s!")
            return True
        except Exception as e:
            print(f"Failed to load HuggingFace model: {e}. Falling back to simulator.")
            self.is_loaded = False
            return False

    def run_simulation(self, text: str, params: Dict[str, Any]) -> Dict[str, Any]:
        temp = params.get("temperature", 0.7)
        top_p = params.get("top_p", 0.9)
        top_k = params.get("top_k", 50)
        token_method = params.get("tokenization_method", "BPE")
        
        # Step 1: Input text analysis
        cleaned_text = text.strip()
        char_count = len(text)
        word_count = len(text.split())
        
        # Use real model if loaded and BPE is requested (GPT2 is BPE)
        if self.is_loaded and token_method == "BPE":
            try:
                inputs = self.tokenizer(cleaned_text, return_tensors="pt")
                input_ids = inputs["input_ids"]
                tokens_list = []
                for idx, t_id in enumerate(input_ids[0].tolist()):
                    token_text = self.tokenizer.decode([t_id])
                    tokens_list.append({
                        "text": token_text,
                        "id": t_id,
                        "start": 0, # simulated for simplification
                        "end": 0
                    })
                
                # Model inference to get activations
                with torch.no_grad():
                    outputs = self.model(**inputs)
                    
                # Extract embeddings (last hidden state, or embedding layer output)
                # Hidden states[0] is the input embedding representation
                embeddings = outputs.hidden_states[0][0].numpy() # [seq_len, d_model]
                seq_len, d_model = embeddings.shape
                
                # Perform SVD/PCA for 3D projections
                centered = embeddings - np.mean(embeddings, axis=0)
                if seq_len > 3:
                    u, s, vh = np.linalg.svd(centered, full_matrices=False)
                    pca_coords = u[:, :3] * s[:3]
                else:
                    pca_coords = np.zeros((seq_len, 3))
                    for i in range(seq_len):
                        pca_coords[i, 0] = math.sin(i)
                        pca_coords[i, 1] = math.cos(i)
                        pca_coords[i, 2] = i * 0.5
                
                # Positional Encoding simulation
                pe = self.mock_engine.get_positional_encoding(seq_len, d_model, params.get("positional_encoding", "Sinusoidal"))
                
                # Self-Attention extraction (from the first layer)
                # attentions is a tuple of layers. Each layer is [1, num_heads, seq_len, seq_len]
                attn_weights = outputs.attentions[0][0].numpy() # [num_heads, seq_len, seq_len]
                num_heads = attn_weights.shape[0]
                
                # Feed Forward layer representation
                ff_info = self.mock_engine.get_feed_forward(embeddings)
                
                # Hidden state: final layer output representation
                hidden_states = outputs.hidden_states[-1][0].numpy() # [seq_len, d_model]
                
                # Next token prediction logic
                next_token_logits = outputs.logits[0, -1, :] / max(temp, 1e-5)
                # Apply top-k filtering
                values, indices = torch.topk(next_token_logits, k=min(top_k, next_token_logits.shape[-1]))
                probs = torch.softmax(values, dim=-1).tolist()
                predictions = []
                for val, idx in zip(probs, indices.tolist()):
                    pred_token = self.tokenizer.decode([idx])
                    predictions.append({
                        "token": pred_token,
                        "id": idx,
                        "probability": round(val * 100, 2)
                    })
                
                # Auto generation: generate 10 tokens to show generation
                generated_ids = input_ids[0].tolist()
                for _ in range(min(params.get("token_limit", 15), 15)):
                    with torch.no_grad():
                        curr_inputs = torch.tensor([generated_ids])
                        curr_outputs = self.model(curr_inputs)
                        logits = curr_outputs.logits[0, -1, :] / max(temp, 1e-5)
                        # simple greedy sampling for demo
                        next_id = int(torch.argmax(logits).item())
                        generated_ids.append(next_id)
                        
                generated_text = self.tokenizer.decode(generated_ids[len(input_ids[0]):])
                
                return {
                    "text": cleaned_text,
                    "char_count": char_count,
                    "word_count": word_count,
                    "tokens": tokens_list,
                    "token_ids": [t["id"] for t in tokens_list],
                    "embeddings": embeddings.tolist(),
                    "pca_coords": pca_coords.tolist(),
                    "positional_encoding": pe.tolist(),
                    "num_layers": len(outputs.hidden_states) - 1,
                    "attention_heads": attn_weights.tolist(),
                    "feed_forward": ff_info,
                    "hidden_states": hidden_states.tolist(),
                    "next_token_probs": predictions,
                    "generated_text": generated_text,
                    "estimated_cost_usd": round(len(tokens_list) * 0.000002, 6)
                }
            except Exception as e:
                print(f"Error in HuggingFace inference: {e}. Falling back to simulation.")
                # fall through to simulated flow below
        
        # Simulated/Mock flow (Fast, handles WordPiece/SentencePiece/offline seamlessly)
        tokens_list = self.mock_engine.tokenize(cleaned_text, token_method)
        token_ids = [t["id"] for t in tokens_list]
        embeddings, pca_coords = self.mock_engine.get_embeddings(tokens_list, d_model=128)
        pe = self.mock_engine.get_positional_encoding(len(tokens_list), d_model=128, mode=params.get("positional_encoding", "Sinusoidal"))
        attn_weights = self.mock_engine.get_attention_weights(len(tokens_list), num_heads=4)
        ff_info = self.mock_engine.get_feed_forward(embeddings)
        hidden_states = (embeddings + pe) * 1.1 # simulate transformation
        predictions = self.mock_engine.get_next_token_probs(tokens_list)
        
        # Generation simulation
        generated_tokens = []
        for i in range(min(params.get("token_limit", 15), 15)):
            generated_tokens.append(predictions[0]["token"] if predictions else "next")
            
        generated_text = " ".join(generated_tokens)
        
        return {
            "text": cleaned_text,
            "char_count": char_count,
            "word_count": word_count,
            "tokens": tokens_list,
            "token_ids": token_ids,
            "embeddings": embeddings.tolist(),
            "pca_coords": pca_coords.tolist(),
            "positional_encoding": pe.tolist(),
            "num_layers": params.get("num_layers", 6),
            "attention_heads": attn_weights.tolist(),
            "feed_forward": ff_info,
            "hidden_states": hidden_states.tolist(),
            "next_token_probs": predictions,
            "generated_text": generated_text,
            "estimated_cost_usd": round(len(tokens_list) * 0.000002, 6)
        }

# Global singleton
llm_service = LLMService()
