# Deep-Dive: Architectural Models

This document contrasts the core architectural designs, attention routers, and information flows of **Model A: Llama 3** (Decoder-Only Causal Model) and **Model B: T5** (Encoder-Decoder Translation Model).

---

## Model A: Llama 3 (Decoder-Only Causal Model)

Llama 3 is an autoregressive model optimized for text generation, code writing, and logical processing.

```text
[Prompt: "Explain AI"] 
        ↓
[Causal Self-Attention Layers]  <-- Future tokens are masked out
        ↓
[Predict: "Artificial"]
        ↓
[Append: "Explain AI Artificial"]  <-- Loop repeats autoregressively
```

### 1. Causal Information Flow
Llama 3 uses a **Decoder-Only** architecture. It processes prompts left-to-right. When computing self-attention weights, it applies a lower-triangular causal mask to ensure that token $i$ can never see or attend to token $i+1$ or onwards. This constraint forces the network to learn to predict subsequent tokens autoregressively.

### 2. Key Structural Innovations

#### Grouped-Query Attention (GQA)
Traditional multi-head attention assigns a distinct Key (K) and Value (V) head to every Query (Q) head. GQA groups Query heads together to share a single K/Value head:

```text
Q Q Q Q  (Query heads)
 \ \ / /
  ▼ ▼
  K V    (Shared Key/Value heads)
```

This reduces the size of the Key-Value (KV) Cache stored in GPU VRAM during generation, allowing the model to support larger batch sizes and context lengths.

#### Rotary Position Embedding (RoPE)
Instead of adding static positional coordinates to token embeddings at the very start of the network, RoPE applies a rotation to the Query and Key vectors inside each attention block:

$$R_{\Theta, m}^d = \text{diag}\left( R_{\theta_1, m}, \dots, R_{\theta_{d/2}, m} \right)$$

This rotational transformation mathematically preserves the relative distance between tokens, improving performance on long-context retrieval tasks.

---

## Model B: T5 (Encoder-Decoder Model)

T5 (Text-to-Text Transfer Transformer) frames every NLP task (translation, classification, summarization) as translating an input text sequence into an output text sequence.

```text
[Source: "translate English to German: The cat"]
                       ↓
         [Bidirectional Encoder (T5)]
                       ↓
         (Contextual Encoder Vectors)
                       ↓  (Cross-Attention query-key matching)
         [   Causal Decoder (T5)    ] ◄── [Target: "Die"]
                       ↓
               [Predict: "Katze"]
```

### 1. Dual-Component Information Flow
T5 splits its computation across two distinct blocks:
* **The Encoder**: Processes the input prompt bidirectionally. There is no causal mask here, meaning the model can look forward and backward to fully digest the source text.
* **The Decoder**: Generates the target sequence autoregressively. It uses a causal attention mask to prevent looking at future generated words.

### 2. Cross-Attention Mechanics
In addition to self-attention layers, T5’s decoder blocks contain **Cross-Attention** layers. This is where the encoder and decoder communicate:

$$\text{Cross-Attention}(Q_{dec}, K_{enc}, V_{enc}) = \text{softmax}\left(\frac{Q_{dec}K_{enc}^T}{\sqrt{d_k}}\right)V_{enc}$$

Here:
* **Queries ($Q_{dec}$)** come from the decoder’s currently generated text representation.
* **Keys ($K_{enc}$)** and **Values ($V_{enc}$)** come from the encoder's complete, bidirectionally processed representations of the source prompt.

This allows the decoder to align its generation with specific regions of the input text (e.g., matching the German word `"Katze"` back to the English word `"cat"` in the source text).
