# LLM INSIDE — Interactive LLM Working Simulator Platform

LLM INSIDE is an interactive educational, developer, and experimentation platform that visually simulates how Large Language Models process text internally.

## System Architecture

```text
User Input
   ↓
Preprocessing
   ↓
Tokenization (BPE / WordPiece / SentencePiece)
   ↓
Token IDs (Vocabulary Mapping)
   ↓
Embeddings (High-Dimensional Semantic Vectors)
   ↓
Positional Encoding (Sinusoidal Waves / RoPE)
   ↓
Transformer Block Layers
   ↓
Multi-Head Self-Attention
   ↓
Feed-Forward Networks (GELU Activation)
   ↓
Hidden States Outputs
   ↓
Probability Distributions (Temperature / Top-P / Top-K)
   ↓
Autoregressive Output Generation
```

---

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS, Framer Motion, HTML Canvas (for rotatable 3D PCA vector space projections)
- **Backend**: FastAPI, Python 3.12, PyTorch CPU, HuggingFace Transformers (`distilgpt2` or `gpt2`)
- **Realtime**: WebSockets for streaming simulation stages
- **Database**: SQLite (default local) / PostgreSQL support

---

## Installation & Setup

### Prerequisites
- Node.js (v18+)
- Python (3.10+)

### Quick Start
Double-click the `run_platform.bat` script in the root directory. This will start the FastAPI backend and Next.js frontend concurrently.

### Manual Launch

#### 1. Backend Setup
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## Customization & Features

- **Pipeline View**: Explore each of the 12 processing stages with detailed scientific equations and visualizations.
- **Experiment Lab**: Test different Temperature, Top-K, and Tokenizer methods side-by-side.
- **Model Comparison**: Review head-to-head structural differences between BERT, GPT-2, and Llama architectures.
- **Scientific Deep Dives**: Learn specialized details about Trading-Based Models (FinBERT vs. PPO Agents) and Core Architectural Models (Llama 3 vs. T5).
- **Interactive Quiz**: Learn transformer equations and earn rewards powered by interactive particles.
- **Exporting**: Download full simulation details as JSON formats or standard PDF documents.
