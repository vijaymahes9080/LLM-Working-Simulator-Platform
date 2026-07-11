'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { GraduationCap, BookOpen, CheckCircle2, Award, FileText, ChevronRight, TrendingUp, Cpu } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIdx: number;
  explanation: string;
}

export default function EducationPage() {
  const [activeTab, setActiveTab] = useState<'tutorial' | 'deepdives' | 'quiz'>('tutorial');
  const [selectedDeepDive, setSelectedDeepDive] = useState<'trading' | 'architecture'>('trading');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submittedQuiz, setSubmittedQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const quizQuestions: QuizQuestion[] = [
    {
      id: 1,
      question: "Why do Transformers require Positional Encoding?",
      options: [
        "To translate tokens to different languages",
        "Because they process all tokens simultaneously and have no inherent concept of token order",
        "To speed up the model's computation time",
        "To limit the size of the vocabulary"
      ],
      correctAnswerIdx: 1,
      explanation: "Since Transformers lack recurrence (like LSTMs/RNNs), they process the entire sequence in parallel. Positional vectors must be added to embeddings so the model knows the position of each word."
    },
    {
      id: 2,
      question: "Which component represents the model's factual database storage?",
      options: [
        "The Positional Encoding wave",
        "The Tokenizer lookup table",
        "The Feed Forward Network (FFN)",
        "The Self-Attention Matrix"
      ],
      correctAnswerIdx: 2,
      explanation: "While attention routes contextual information between tokens, the Feed Forward Networks apply localized point-wise mapping which researches suggest stores the factual key-value memories of the model."
    },
    {
      id: 3,
      question: "What happens when you lower the temperature value (e.g. from 1.0 to 0.1)?",
      options: [
        "The output becomes highly creative and random",
        "The token generation speed decreases",
        "The output becomes highly deterministic and repetitive",
        "The model requires more layers to compute"
      ],
      correctAnswerIdx: 2,
      explanation: "Lower temperatures scale down logit variances before softmax, concentrating probability onto the absolute top prediction. This leads to highly focused, deterministic text."
    }
  ];

  const handleSelectAnswer = (qId: number, optionIdx: number) => {
    if (submittedQuiz) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [qId]: optionIdx
    }));
  };

  const handleSubmitQuiz = () => {
    let score = 0;
    quizQuestions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswerIdx) {
        score++;
      }
    });
    setQuizScore(score);
    setSubmittedQuiz(true);

    if (score === quizQuestions.length) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setSubmittedQuiz(false);
    setQuizScore(0);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-2 text-violet-400">
            <GraduationCap className="h-6 w-6" />
            <h1 className="text-xl font-bold text-white">LLM Academy & Deep Dives</h1>
          </div>
          
          <div className="flex bg-white/5 p-1 rounded-lg border border-white/5 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('tutorial')}
              className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                activeTab === 'tutorial' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Lessons Walkthrough
            </button>
            <button
              onClick={() => setActiveTab('deepdives')}
              className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                activeTab === 'deepdives' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Scientific Deep Dives
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                activeTab === 'quiz' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Interactive Quiz
            </button>
          </div>
        </div>

        {/* Tab 1: Tutorial */}
        {activeTab === 'tutorial' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Step 1: Text to Vectors */}
            <div className="glass-panel p-5 bg-black/40 border border-white/5 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-violet-400 font-mono text-sm border-b border-white/5 pb-2">
                <span className="w-5 h-5 rounded-full bg-violet-600/20 flex items-center justify-center font-bold">1</span>
                <span>From Letters to Coordinates</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Computers can't read words. First, text is split into tokens (subwords). Each token corresponds to an ID in a dictionary vocabulary. 
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                The ID matches a specific row in a dense coordinate embedding matrix (e.g. 768 floating dimensions). Words with similar meanings end up mapped closely together in this vector coordinate space.
              </p>
            </div>

            {/* Step 2: Attention routing */}
            <div className="glass-panel p-5 bg-black/40 border border-white/5 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-violet-400 font-mono text-sm border-b border-white/5 pb-2">
                <span className="w-5 h-5 rounded-full bg-violet-600/20 flex items-center justify-center font-bold">2</span>
                <span>The Attention Superhighway</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Unlike older recurrent architectures which read left-to-right, Transformers look at all tokens at the same time. Positional Sine waves are added to embeddings to supply coordinate positioning.
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tokens then calculate Queries, Keys, and Values. Self-Attention weights route context across tokens so verbs align with nouns and pronouns link back to subjects.
              </p>
            </div>

            {/* Step 3: Probabilities */}
            <div className="glass-panel p-5 bg-black/40 border border-white/5 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-violet-400 font-mono text-sm border-b border-white/5 pb-2">
                <span className="w-5 h-5 rounded-full bg-violet-600/20 flex items-center justify-center font-bold">3</span>
                <span>Autoregressive Predictions</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                After passing through multiple layers, vectors exit the final block. A linear decoder maps vectors back to vocabulary coordinates, generating Logits.
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Softmax computes a probability score (0-100%) for every potential next token. The top predicted word is chosen, appended to the prompt, and the cycle runs again to generate subsequent words.
              </p>
            </div>

          </div>
        )}

        {/* Tab 2: Scientific Deep Dives (INTEGRATED FROM /DOCS) */}
        {activeTab === 'deepdives' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Sidebar articles selector */}
            <div className="lg:col-span-3 flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Documentation Modules</span>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => setSelectedDeepDive('trading')}
                  className={`text-left px-4 py-3 rounded-xl border text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                    selectedDeepDive === 'trading'
                      ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <TrendingUp className="h-4 w-4 shrink-0" />
                  Trading-Based Models
                </button>
                <button
                  onClick={() => setSelectedDeepDive('architecture')}
                  className={`text-left px-4 py-3 rounded-xl border text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                    selectedDeepDive === 'architecture'
                      ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <Cpu className="h-4 w-4 shrink-0" />
                  Architectural Models
                </button>
              </div>
            </div>

            {/* Central Article Viewer */}
            <div className="lg:col-span-9 glass-panel p-6 bg-black/40 border border-white/5 flex flex-col gap-6">
              
              {selectedDeepDive === 'trading' ? (
                // FinBERT vs PPO Trading Article
                <div className="flex flex-col gap-4 text-slate-300 leading-relaxed text-sm">
                  <div className="border-b border-white/5 pb-2.5 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-violet-400" />
                    <h2 className="text-lg font-bold text-white">Trading-Based Models</h2>
                  </div>
                  <p>
                    Trading-based models are optimized to analyze financial data, estimate market sentiments, and execute transactions. This module compares <strong>FinBERT</strong> (Sentiment Analysis) and <strong>PPO Agents</strong> (Execution Policy).
                  </p>

                  <h3 className="font-bold text-white text-sm mt-3 flex items-center gap-1.5"><ChevronRight className="h-4 w-4 text-violet-400" /> Model A: FinBERT (Financial Sentiment Parser)</h3>
                  <p className="text-xs text-slate-400">
                    FinBERT is a domain-specific adaptation of the BERT (Bidirectional Encoder Representations from Transformers) model, developed to analyze the sentiment of financial texts.
                  </p>
                  
                  <div className="bg-black/50 border border-white/5 p-3 rounded-lg font-mono text-xs text-violet-300">
                    Input: "Federal Reserve hikes interest rates by 25 basis points; yields climb"<br/>
                    ↓ [Bidirectional Encoder]<br/>
                    ↓ [CLS Token Context Pooling]<br/>
                    Class Scores: [Positive: 12.5%, Neutral: 18.0%, Negative: 69.5% (Bullish/Bearish Signal)]
                  </div>

                  <p className="text-xs text-slate-400">
                    <strong>Encoder-Only Architecture:</strong> FinBERT processes sentences bidirectionally (no causal mask), allowing every token to look forward and backward. This is crucial for financial texts where modifying words at the end can reverse the sentiment of a sentence.
                  </p>

                  <h3 className="font-bold text-white text-sm mt-3 flex items-center gap-1.5"><ChevronRight className="h-4 w-4 text-violet-400" /> Model B: Stable-Baselines3 PPO Agent (Execution Policy)</h3>
                  <p className="text-xs text-slate-400">
                    While FinBERT parses news, the PPO (Proximal Policy Optimization) Agent processes numerical technical indicators to execute actual buy, hold, or sell orders.
                  </p>

                  <div className="bg-black/50 border border-white/5 p-3 rounded-lg font-mono text-xs text-violet-300 font-bold">
                    Reward = (Delta Portfolio Value) - Slippage - Transaction Fees - (Volatility Drawdown)
                  </div>

                  <p className="text-xs text-slate-400">
                    <strong>Reward Optimization:</strong> Unlike LLMs which predict vocabulary distributions, the PPO agent predicts numeric actions (discrete choices or portfolio weights) to optimize Sharpe Ratios over long trading horizons.
                  </p>
                </div>
              ) : (
                // Llama 3 vs T5 Architecture Article
                <div className="flex flex-col gap-4 text-slate-300 leading-relaxed text-sm">
                  <div className="border-b border-white/5 pb-2.5 flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-violet-400" />
                    <h2 className="text-lg font-bold text-white">Architectural Models</h2>
                  </div>
                  <p>
                    This module contrasts the core architectural designs, attention routers, and information flows of <strong>Llama 3</strong> (Decoder-Only Causal Model) and <strong>T5</strong> (Encoder-Decoder Translation Model).
                  </p>

                  <h3 className="font-bold text-white text-sm mt-3 flex items-center gap-1.5"><ChevronRight className="h-4 w-4 text-violet-400" /> Model A: Llama 3 (Decoder-Only Causal Model)</h3>
                  <p className="text-xs text-slate-400">
                    Llama 3 is an autoregressive model optimized for text generation, code writing, and logical processing.
                  </p>

                  <div className="bg-black/50 border border-white/5 p-3 rounded-lg font-mono text-xs text-violet-300">
                    [Prompt: "Explain AI"] → [Causal Self-Attention] → Predict: "Artificial" → Append Causal Loop
                  </div>

                  <p className="text-xs text-slate-400">
                    <strong>Grouped-Query Attention (GQA):</strong> Multiple query heads share a single Key/Value head. This significantly reduces memory usage in the KV-Cache during token-by-token generation.
                  </p>

                  <h3 className="font-bold text-white text-sm mt-3 flex items-center gap-1.5"><ChevronRight className="h-4 w-4 text-violet-400" /> Model B: T5 (Encoder-Decoder Model)</h3>
                  <p className="text-xs text-slate-400">
                    T5 (Text-to-Text Transfer Transformer) frames every NLP task as converting one text sequence to another (e.g. translation, summarization).
                  </p>

                  <div className="bg-black/50 border border-white/5 p-3 rounded-lg font-mono text-xs text-violet-300">
                    [Encoder Bidirectional Process] → [Cross-Attention Matching] → [Causal Decoder Generator]
                  </div>

                  <p className="text-xs text-slate-400">
                    <strong>Cross-Attention Mechanics:</strong> Decoder Query vectors attend to the Encoder Key and Value vectors, aligning the generated translation output directly with the source text.
                  </p>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Tab 3: Quiz */}
        {activeTab === 'quiz' && (
          <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">
            
            {submittedQuiz && (
              <div className="glass-panel p-6 bg-violet-600/10 border border-violet-500/20 flex flex-col items-center text-center gap-2">
                <Award className="h-10 w-10 text-violet-400" />
                <h3 className="text-lg font-bold text-white">Quiz Completed!</h3>
                <span className="text-xl font-extrabold text-violet-300">Score: {quizScore} / {quizQuestions.length}</span>
                {quizScore === quizQuestions.length ? (
                  <span className="text-xs text-emerald-400 font-semibold">Perfect score! You are officially an LLM Architect! 🎉</span>
                ) : (
                  <button
                    onClick={handleResetQuiz}
                    className="mt-2 text-xs font-semibold bg-white/5 border border-white/10 hover:bg-white/10 px-3 py-1.5 rounded-lg text-slate-300 hover:text-white cursor-pointer"
                  >
                    Try Again
                  </button>
                )}
              </div>
            )}

            <div className="flex flex-col gap-6">
              {quizQuestions.map((q) => {
                const isSelected = selectedAnswers[q.id] !== undefined;
                const activeSelection = selectedAnswers[q.id];
                return (
                  <div key={q.id} className="glass-panel p-5 bg-black/40 border border-white/5 flex flex-col gap-3">
                    <span className="text-xs font-mono text-violet-400 font-semibold">Question {q.id}</span>
                    <h3 className="text-sm font-bold text-white leading-relaxed">{q.question}</h3>
                    
                    <div className="flex flex-col gap-2 mt-2">
                      {q.options.map((opt, idx) => {
                        const optionSelected = activeSelection === idx;
                        const isCorrect = q.correctAnswerIdx === idx;
                        let optionStyle = "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:text-white";
                        
                        if (submittedQuiz) {
                          if (isCorrect) {
                            optionStyle = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-semibold";
                          } else if (optionSelected) {
                            optionStyle = "bg-red-500/10 border-red-500/30 text-red-400";
                          } else {
                            optionStyle = "bg-white/5 border-white/5 text-slate-500 opacity-60";
                          }
                        } else if (optionSelected) {
                          optionStyle = "bg-violet-600/20 border-violet-500 text-violet-300 font-semibold";
                        }

                        return (
                          <button
                            key={idx}
                            disabled={submittedQuiz}
                            onClick={() => handleSelectAnswer(q.id, idx)}
                            className={`text-left px-4 py-2.5 rounded-lg border text-xs transition-colors flex items-center justify-between cursor-pointer ${optionStyle}`}
                          >
                            <span>{opt}</span>
                            {submittedQuiz && isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {submittedQuiz && (
                      <div className="mt-2 p-3 bg-white/5 border border-white/5 rounded-lg text-xs text-slate-400 leading-relaxed font-mono">
                        <strong className="text-violet-400 block mb-0.5">Explanation:</strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}

              {!submittedQuiz && (
                <button
                  onClick={handleSubmitQuiz}
                  className="bg-violet-600 hover:bg-violet-500 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors text-center cursor-pointer"
                >
                  Submit Quiz Answers
                </button>
              )}
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
