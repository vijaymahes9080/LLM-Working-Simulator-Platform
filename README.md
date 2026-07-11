# 🧠 LLM Working Simulator Platform

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.12-blue?logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/PyTorch-CPU-EE4C2C?logo=pytorch&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-green" />
  <img src="https://img.shields.io/badge/Status-Active-brightgreen" />
</p>

<p align="center">
  An interactive educational and developer experimentation platform that <strong>visually simulates</strong> how Large Language Models process text internally — stage by stage, in real time.
</p>

---

## 📚 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Usage](#usage)
- [Contributing](#contributing)
- [Author](#author)
- [License](#license)

---

## Overview

**LLM Working Simulator Platform** (codename **LLM INSIDE**) demystifies the inner workings of transformer-based language models. Users can feed any text prompt and watch it travel through every processing stage — from raw characters to probability distributions and final token output — with scientific equations, attention heatmaps, and interactive visualizations at each step.

Whether you are a student, researcher, or engineer, this platform turns abstract NLP theory into an explorable, hands-on experience.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔬 **Pipeline View** | Step through all 12 transformer stages with equations and diagrams |
| 🧪 **Experiment Lab** | Compare Temperature, Top-K, Top-P, and tokenizer strategies side-by-side |
| 🤖 **Model Comparison** | Head-to-head structural diff between BERT, GPT-2, and Llama 3 |
| 📈 **Analytics Dashboard** | Session history, token throughput, latency metrics, and export tools |
| 🎓 **Interactive Quiz** | Earn rewards by solving transformer equations (powered by particle animations) |
| 📡 **Real-time Streaming** | WebSocket-driven live simulation with per-stage progress updates |
| 📥 **Export** | Download simulation results as JSON or PDF |
| 🔐 **Auth** | JWT-based user authentication with role-based access |
| 🗄️ **Flexible DB** | SQLite for local dev, PostgreSQL-ready for production |

---

## System Architecture

```text
User Input (prompt text)
        │
        ▼
┌──────────────────┐
│  Preprocessing   │  Strip, normalize, clean
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Tokenization                    │  BPE / WordPiece / SentencePiece
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────┐
│  Token IDs       │  Vocabulary mapping  (vocab size ~50,257 for GPT-2)
└────────┬─────────┘
         │
         ▼
┌──────────────────────────┐
│  Embeddings              │  High-dimensional semantic vectors  (d_model = 768)
└────────┬─────────────────┘
         │
         ▼
┌────────────────────────────────┐
│  Positional Encoding           │  Sinusoidal waves / RoPE
└────────┬───────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Transformer Block × N layers       │
│  ┌──────────────────────────────┐   │
│  │  Multi-Head Self-Attention   │   │  Scaled dot-product attention
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │  Feed-Forward Network        │   │  GELU activation, 4× expansion
│  └──────────────────────────────┘   │
└────────┬────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  Output Probability Distribution     │  Temperature · Top-P · Top-K sampling
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Autoregressive Output   │  Token-by-token generation → decoded text
└──────────────────────────┘
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Role |
|---|---|
| **Python 3.12** | Runtime |
| **FastAPI** | REST API + WebSocket server |
| **Uvicorn** | ASGI server |
| **PyTorch (CPU)** | LLM inference engine |
| **HuggingFace Transformers** | `distilgpt2` / `gpt2` model loading |
| **SQLAlchemy** | ORM |
| **SQLite / PostgreSQL** | Database |
| **JWT / OAuth2** | Authentication |

### Frontend
| Technology | Role |
|---|---|
| **Next.js 14** | React framework (App Router) |
| **React 18** | UI library |
| **TypeScript** | Type-safe code |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Animations & transitions |
| **HTML Canvas** | Rotatable 3D PCA vector-space projections |

---

## 📁 Project Structure

```
LLM-Working-Simulator-Platform/
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI app entry point
│   │   ├── database.py           # SQLAlchemy engine & session
│   │   ├── models/               # ORM models (user, session, analytics)
│   │   ├── routers/              # API route handlers
│   │   └── services/             # Business logic (LLM, auth, export)
│   └── requirements.txt          # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── app/                  # Next.js App Router pages
│   │   ├── components/           # Reusable React components
│   │   ├── contexts/             # React context providers
│   │   └── hooks/                # Custom React hooks
│   ├── public/                   # Static assets
│   └── package.json
├── docs/
│   ├── architectural_models.md   # LLM architecture deep-dives
│   └── trading_models.md         # Financial model comparisons
├── composer.json                 # PHP project metadata / author info
├── run_platform.bat              # One-click Windows launcher
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** v18+
- **Python** 3.10+
- **Git**

### ⚡ Quick Start (Windows)

Double-click **`run_platform.bat`** in the project root. It will automatically start the FastAPI backend and Next.js frontend concurrently.

### Manual Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/vijaymahes9080/LLM-Working-Simulator-Platform.git
cd LLM-Working-Simulator-Platform
```

#### 2. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS / Linux
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

API available at: `http://localhost:8000`  
Interactive docs: `http://localhost:8000/docs`

#### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App available at: `http://localhost:3000`

---

## 🎮 Usage

1. Open `http://localhost:3000` in your browser.
2. Register / log in with your credentials.
3. Enter any text prompt in the **Simulator** panel.
4. Click **Run Simulation** and watch the pipeline animate in real time.
5. Explore individual stages, attention heatmaps, and token probability charts.
6. Use the **Experiment Lab** to tweak sampling parameters and compare outputs.
7. Export your session as JSON or PDF from the **Analytics** page.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please ensure your code follows existing patterns and includes appropriate documentation.

---

## 👤 Author

**Vijay Mahes**  
📧 [Vijaypradhap2004@gmail.com](mailto:Vijaypradhap2004@gmail.com)  
🐙 [@vijaymahes9080](https://github.com/vijaymahes9080)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
