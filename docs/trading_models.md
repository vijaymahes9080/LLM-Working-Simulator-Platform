# Deep-Dive: Trading-Based Models

Trading-based models are optimized to analyze financial data, estimate market sentiments, and execute transactions. This document breaks down the differences between **Model A: FinBERT** (Sentiment Analysis) and **Model B: PPO Agent** (Execution Policy).

---

## Model A: FinBERT (Financial Sentiment Parser)

FinBERT is a domain-specific adaptation of the BERT (Bidirectional Encoder Representations from Transformers) model, developed to analyze the sentiment of financial texts.

```text
Input Headline: "Federal Reserve hikes interest rates by 25 basis points; yields climb"
       ↓
[Bidirectional Encoder (FinBERT)]
       ↓
[CLS Token Context Pooling]
       ↓
Softmax Classification
  - Positive: 12.5%
  - Neutral:  18.0%
  - Negative: 69.5%  <-- Selected Alpha Signal
```

### 1. Underlying Architecture
FinBERT utilizes an **Encoder-Only** transformer structure. Because it does not use a causal mask, every token in the input sentence can attend to all other tokens bidirectionally. This is crucial for sentiment analysis, where qualifying words at the end of a sentence can completely flip the meaning of words at the beginning.

### 2. Domain Adaptations
* **Vocabulary Weights**: Standard BERT is trained on Wikipedia and BookCorpus, where words like *"depreciation"* or *"margin"* are treated neutrally. FinBERT is fine-tuned on the **Financial PhraseBank** dataset, adapting its internal weights to recognize these as negative risk indicators.
* **Semantic Tuning**: The model understands complex financial phrasing. For instance, in standard English, *"Interest rates remain unchanged"* is simple statement. FinBERT evaluates this relative to market expectations to assign positive or negative scores.

### 3. Execution Pipeline
1. **Tokenization**: The input sentence is split using WordPiece tokenization.
2. **Context Routing**: Self-attention layers compute query-key matches across all token coordinates simultaneously.
3. **Classification Projection**: The final hidden state of the special `[CLS]` token (representing the pooled context of the sentence) is passed through a dense layer to output scores for three classes:
   
   $$\text{Sentiment Score} = [\text{Positive}, \text{Neutral}, \text{Negative}]$$

---

## Model B: Stable-Baselines3 PPO Agent (Execution Policy)

While FinBERT parses news, the PPO (Proximal Policy Optimization) Agent processes numerical charts to execute actual buy, hold, or sell orders.

```text
Market State (S_t) -> [PPO Agent (Actor-Critic)] -> Action (A_t)
   - RSI: 34.2                                        - Action: Buy +25%
   - MACD: -0.15                                      - Value: $10,450
   - Cash: $10,000
```

### 1. Underlying Architecture
Unlike LLMs, a PPO Agent does not use a large text vocabulary. It utilizes an **Actor-Critic** neural network (typically composed of Multi-Layer Perceptrons or lightweight LSTMs):
* **Actor Network**: Outputs the policy $\pi(a|s)$ representing the probability distribution over possible actions.
* **Critic Network**: Estimates the value function $V(s)$ representing the expected future returns from the current market state.

### 2. The PPO Objective Function
To prevent the policy from changing too drastically in one update step (which could lead to catastrophic portfolio losses), PPO clips the policy ratio:

$$L^{CLIP}(\theta) = \hat{\mathbb{E}}_t \left[ \min\left( r_t(\theta)\hat{A}_t, \, \text{clip}(r_t(\theta), 1-\epsilon, 1+\epsilon)\hat{A}_t \right) \right]$$

Where:
* $r_t(\theta) = \frac{\pi_\theta(a_t|s_t)}{\pi_{\theta_{old}}(a_t|s_t)}$ is the probability ratio between the new and old policy.
* $\hat{A}_t$ is the estimated advantage (how much better this action is than average).
* $\epsilon$ is the clipping parameter (typically $0.1$ or $0.2$).

### 3. Operational Loop
1. **State Space Ingestion ($S_t$)**: The agent reads a vector containing technical indicators (RSI, MACD, Moving Averages, volatility indices) and its current account inventory (cash vs. asset holdings).
2. **Action Execution ($A_t$)**: The Actor network outputs a continuous target weight (e.g. allocate `45%` of capital to ETH) or a discrete trading signal (Buy, Hold, Sell).
3. **Reward Optimization ($R_t$)**: The agent updates its parameters to maximize returns while minimizing risk:
   
   $$\text{Reward} = \Delta \text{Portfolio Value} - \text{Slippage} - \text{Transaction Fees} - \lambda(\text{Drawdown})$$
