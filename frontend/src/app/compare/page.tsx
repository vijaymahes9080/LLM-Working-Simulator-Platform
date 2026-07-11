'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { GitCompare, Sparkles, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '@/config';

interface ModelSpec {
  id: string;
  name: string;
  type: string;
  tokenizer: string;
  layers: number;
  heads: number;
  description: string;
  speed: string;
}

export default function ComparePage() {
  const [models, setModels] = useState<ModelSpec[]>([]);
  const [modelA, setModelA] = useState('gpt2');
  const [modelB, setModelB] = useState('distilgpt2');
  const [comparison, setComparison] = useState<any>(null);

  useEffect(() => {
    // Retrieve supported models from backend
    fetch(`${API_BASE_URL}/models/list`)
      .then((res) => res.json())
      .then((data) => {
        setModels(data);
      })
      .catch(() => {
        // Fallback offline specs
        const fallbackList = [
          { id: "gpt2", name: "GPT-2 (117M params)", type: "Causal LM", tokenizer: "BPE", layers: 12, heads: 12, description: "Standard Generative Pre-trained Transformer 2 model released by OpenAI.", speed: "Fast" },
          { id: "distilgpt2", name: "DistilGPT-2 (82M params)", type: "Causal LM", tokenizer: "BPE", layers: 6, heads: 8, description: "Distilled, smaller and faster version of GPT-2.", speed: "Ultra Fast" },
          { id: "bert-base", name: "BERT-Base", type: "Masked LM", tokenizer: "WordPiece", layers: 12, heads: 12, description: "Bidirectional Encoder Representations from Transformers by Google.", speed: "Medium" },
          { id: "llama-tiny-sim", name: "Llama 3 (Simulated)", type: "Causal LM", tokenizer: "SentencePiece", layers: 32, heads: 32, description: "Simulated view of Meta's Llama 3 architectures.", speed: "Simulated Instant" }
        ];
        setModels(fallbackList);
      });
  }, []);

  useEffect(() => {
    if (!modelA || !modelB) return;
    
    fetch(`${API_BASE_URL}/models/compare?model_a=${modelA}&model_b=${modelB}`)
      .then((res) => res.json())
      .then((data) => {
        setComparison(data);
      })
      .catch(() => {
        // Offline fallback
        const specs: Record<string, any> = {
          gpt2: { id: "gpt2", name: "GPT-2 (117M params)", type: "Causal LM", tokenizer: "BPE", layers: 12, heads: 12, description: "Standard Generative Pre-trained Transformer 2 model.", speed: "Fast" },
          distilgpt2: { id: "distilgpt2", name: "DistilGPT-2 (82M params)", type: "Causal LM", tokenizer: "BPE", layers: 6, heads: 8, description: "Distilled, smaller and faster version.", speed: "Ultra Fast" },
          'bert-base': { id: "bert-base", name: "BERT-Base", type: "Masked LM", tokenizer: "WordPiece", layers: 12, heads: 12, description: "Google's bidirectional transformer.", speed: "Medium" },
          'llama-tiny-sim': { id: "llama-tiny-sim", name: "Llama 3 (Simulated)", type: "Causal LM", tokenizer: "SentencePiece", layers: 32, heads: 32, description: "Meta's open-source model.", speed: "Simulated Instant" }
        };
        const a = specs[modelA] || specs.gpt2;
        const b = specs[modelB] || specs.distilgpt2;
        setComparison({
          model_a: a,
          model_b: b,
          comparison_metrics: {
            parameter_ratio: a.id === 'gpt2' && b.id === 'distilgpt2' ? '1.4x larger' : 'Varies',
            tokenizer_difference: `${a.tokenizer} vs ${b.tokenizer}`,
            attention_heads: `${a.heads} vs ${b.heads}`,
            layers: `${a.layers} vs ${b.layers}`
          }
        });
      });
  }, [modelA, modelB]);

  const specA = comparison?.model_a;
  const specB = comparison?.model_b;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-violet-400">
            <GitCompare className="h-5 w-5" />
            <h1 className="text-xl font-bold text-white">Model Architecture Comparer</h1>
          </div>
          <p className="text-xs text-slate-400">
            Compare model dimensions, tokenization structures, and layers between generative causal architectures and bidirectional representation encoders.
          </p>
        </div>

        {/* Selection panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/5 border border-white/5 p-4 rounded-xl">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Model A</label>
            <select
              value={modelA}
              onChange={(e) => setModelA(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-lg p-2.5 text-sm text-white"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Model B</label>
            <select
              value={modelB}
              onChange={(e) => setModelB(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-lg p-2.5 text-sm text-white"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison Details Grid */}
        {specA && specB && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Model A Specs */}
            <div className="md:col-span-4 glass-panel p-5 bg-black/40 border border-white/5 flex flex-col gap-3">
              <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">Model A Specs</span>
              <h3 className="text-lg font-bold text-white">{specA.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed min-h-[50px]">{specA.description}</p>
              
              <div className="border-t border-white/5 pt-3 flex flex-col gap-2 font-mono text-xs text-slate-300">
                <div className="flex justify-between"><span>Type:</span><span className="text-white">{specA.type}</span></div>
                <div className="flex justify-between"><span>Tokenizer:</span><span className="text-violet-300">{specA.tokenizer}</span></div>
                <div className="flex justify-between"><span>Layers Count:</span><span className="text-white">{specA.layers}</span></div>
                <div className="flex justify-between"><span>Attention Heads:</span><span className="text-white">{specA.heads}</span></div>
                <div className="flex justify-between"><span>Speed:</span><span className="text-emerald-400">{specA.speed}</span></div>
              </div>
            </div>

            {/* Comparison Metrics */}
            <div className="md:col-span-4 glass-panel p-5 bg-black/40 border border-white/5 flex flex-col gap-4 justify-center items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600/10 border border-violet-500/20 text-violet-400">
                <Sparkles className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Key Architecture Differences</span>
              
              <div className="flex flex-col gap-3.5 w-full mt-2 font-mono text-xs text-slate-300">
                <div className="bg-white/5 p-3 rounded border border-white/5">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Attention Heads</span>
                  <span className="text-violet-400 font-bold text-sm mt-0.5 block">{comparison.comparison_metrics.attention_heads}</span>
                </div>
                <div className="bg-white/5 p-3 rounded border border-white/5">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Layers Difference</span>
                  <span className="text-violet-400 font-bold text-sm mt-0.5 block">{comparison.comparison_metrics.layers}</span>
                </div>
                <div className="bg-white/5 p-3 rounded border border-white/5">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Tokenizers Comparison</span>
                  <span className="text-violet-400 font-bold text-sm mt-0.5 block">{comparison.comparison_metrics.tokenizer_difference}</span>
                </div>
              </div>
            </div>

            {/* Model B Specs */}
            <div className="md:col-span-4 glass-panel p-5 bg-black/40 border border-white/5 flex flex-col gap-3">
              <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">Model B Specs</span>
              <h3 className="text-lg font-bold text-white">{specB.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed min-h-[50px]">{specB.description}</p>
              
              <div className="border-t border-white/5 pt-3 flex flex-col gap-2 font-mono text-xs text-slate-300">
                <div className="flex justify-between"><span>Type:</span><span className="text-white">{specB.type}</span></div>
                <div className="flex justify-between"><span>Tokenizer:</span><span className="text-violet-300">{specB.tokenizer}</span></div>
                <div className="flex justify-between"><span>Layers Count:</span><span className="text-white">{specB.layers}</span></div>
                <div className="flex justify-between"><span>Attention Heads:</span><span className="text-white">{specB.heads}</span></div>
                <div className="flex justify-between"><span>Speed:</span><span className="text-emerald-400">{specB.speed}</span></div>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
