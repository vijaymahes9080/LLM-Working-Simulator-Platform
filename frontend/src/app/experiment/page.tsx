'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Layers, Play, RefreshCw, HelpCircle, Sliders } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ExperimentPage() {
  const { token } = useAuth();
  
  const [prompt, setPrompt] = useState('Explain Artificial Intelligence');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Config A
  const [tempA, setTempA] = useState(0.2);
  const [topKA, setTopKA] = useState(10);
  const [tokA, setTokA] = useState('BPE');
  const [resA, setResA] = useState<any>(null);

  // Config B
  const [tempB, setTempB] = useState(1.2);
  const [topKB, setTopKB] = useState(80);
  const [tokB, setTokB] = useState('SentencePiece');
  const [resB, setResB] = useState<any>(null);

  const runExperiment = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      // Fetch Config A
      const reqA = fetch('http://localhost:8000/simulate/run', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          prompt,
          temperature: tempA,
          top_k: topKA,
          tokenization_method: tokA,
          token_limit: 15
        })
      });

      // Fetch Config B
      const reqB = fetch('http://localhost:8000/simulate/run', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          prompt,
          temperature: tempB,
          top_k: topKB,
          tokenization_method: tokB,
          token_limit: 15
        })
      });

      const [resA_raw, resB_raw] = await Promise.all([reqA, reqB]);
      const dataA = await resA_raw.json();
      const dataB = await resB_raw.json();

      if (!resA_raw.ok || !resB_raw.ok) {
        throw new Error('One of the simulation requests failed');
      }

      setResA(dataA.simulation);
      setResB(dataB.simulation);
    } catch (err: any) {
      setError(err.message || 'Error processing parallel simulations. Please run the backend service.');
      
      // Local simulated fallback
      setResA({
        tokens: Array.from({ length: 8 }),
        generated_text: "Artificial intelligence is a branch of computer science that builds smart systems.",
        next_token_probs: [{ token: "is", probability: 82 }, { token: "are", probability: 10 }]
      });
      setResB({
        tokens: Array.from({ length: 12 }),
        generated_text: "AI might represent convolutional networks, autonomous sentient androids, or simple matrix algorithms.",
        next_token_probs: [{ token: "might", probability: 28 }, { token: "could", probability: 24 }]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-violet-400">
            <Layers className="h-5 w-5" />
            <h1 className="text-xl font-bold text-white">Parameter Experimentation Lab</h1>
          </div>
          <p className="text-xs text-slate-400">
            Run side-by-side simulations to understand how hyper-parameters control randomness, word selections, and speed outputs.
          </p>
        </div>

        {/* Prompt section */}
        <div className="glass-panel p-5 bg-black/40 border border-white/5 flex gap-4">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-grow bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 text-white"
            placeholder="Enter experiment sentence..."
          />
          <button
            onClick={runExperiment}
            disabled={loading}
            className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm cursor-pointer transition-colors flex items-center gap-1.5"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}
            Compare
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs">
            {error}
          </div>
        )}

        {/* Side-by-Side Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Simulation A */}
          <div className="glass-panel p-5 bg-black/40 border border-white/5 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">Configuration A</span>
              <span className="text-[10px] text-slate-500">Deterministic / Focused</span>
            </div>

            {/* Config Inputs A */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-slate-400">Temperature</label>
                <input
                  type="number" step="0.1" min="0.1" max="1.5"
                  value={tempA} onChange={(e) => setTempA(parseFloat(e.target.value))}
                  className="bg-black/40 border border-white/10 rounded p-1 text-white font-mono"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-slate-400">Top-K</label>
                <input
                  type="number" min="1" max="100"
                  value={topKA} onChange={(e) => setTopKA(parseInt(e.target.value))}
                  className="bg-black/40 border border-white/10 rounded p-1 text-white font-mono"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-slate-400">Tokenizer</label>
                <select
                  value={tokA} onChange={(e) => setTokA(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded p-1 text-white"
                >
                  <option value="BPE">BPE</option>
                  <option value="WordPiece">WordPiece</option>
                  <option value="SentencePiece">SentencePiece</option>
                </select>
              </div>
            </div>

            {/* Results A */}
            {resA ? (
              <div className="flex flex-col gap-3.5 mt-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Generated Output</span>
                  <div className="p-3 bg-black/50 border border-white/5 rounded-lg text-xs font-mono text-emerald-400">
                    {resA.generated_text}
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs bg-white/5 p-2 rounded border border-white/5 font-mono">
                  <span className="text-slate-400">Tokens Ingested:</span>
                  <span className="text-white font-bold">{resA.tokens?.length || 0}</span>
                </div>

                {/* Top Prediction Probabilities */}
                <div className="flex flex-col gap-1.5 mt-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Top Predictions Distribution</span>
                  <div className="flex flex-col gap-1.5">
                    {resA.next_token_probs?.slice(0, 3).map((p: any, idx: number) => (
                      <div key={idx} className="flex flex-col gap-0.5 text-xs font-mono">
                        <div className="flex justify-between">
                          <span className="text-white">"{p.token}"</span>
                          <span className="text-violet-400">{p.probability}%</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-violet-500" style={{ width: `${p.probability}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-xs text-slate-600 py-12 italic border border-dashed border-white/5 rounded-lg">
                Click Compare to load simulation results
              </div>
            )}
          </div>

          {/* Simulation B */}
          <div className="glass-panel p-5 bg-black/40 border border-white/5 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">Configuration B</span>
              <span className="text-[10px] text-slate-500">Creative / Explorative</span>
            </div>

            {/* Config Inputs B */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-slate-400">Temperature</label>
                <input
                  type="number" step="0.1" min="0.1" max="1.5"
                  value={tempB} onChange={(e) => setTempB(parseFloat(e.target.value))}
                  className="bg-black/40 border border-white/10 rounded p-1 text-white font-mono"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-slate-400">Top-K</label>
                <input
                  type="number" min="1" max="100"
                  value={topKB} onChange={(e) => setTopKB(parseInt(e.target.value))}
                  className="bg-black/40 border border-white/10 rounded p-1 text-white font-mono"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-slate-400">Tokenizer</label>
                <select
                  value={tokB} onChange={(e) => setTokB(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded p-1 text-white"
                >
                  <option value="BPE">BPE</option>
                  <option value="WordPiece">WordPiece</option>
                  <option value="SentencePiece">SentencePiece</option>
                </select>
              </div>
            </div>

            {/* Results B */}
            {resB ? (
              <div className="flex flex-col gap-3.5 mt-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Generated Output</span>
                  <div className="p-3 bg-black/50 border border-white/5 rounded-lg text-xs font-mono text-emerald-400">
                    {resB.generated_text}
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs bg-white/5 p-2 rounded border border-white/5 font-mono">
                  <span className="text-slate-400">Tokens Ingested:</span>
                  <span className="text-white font-bold">{resB.tokens?.length || 0}</span>
                </div>

                {/* Top Prediction Probabilities */}
                <div className="flex flex-col gap-1.5 mt-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Top Predictions Distribution</span>
                  <div className="flex flex-col gap-1.5">
                    {resB.next_token_probs?.slice(0, 3).map((p: any, idx: number) => (
                      <div key={idx} className="flex flex-col gap-0.5 text-xs font-mono">
                        <div className="flex justify-between">
                          <span className="text-white">"{p.token}"</span>
                          <span className="text-violet-400">{p.probability}%</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-violet-500" style={{ width: `${p.probability}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-xs text-slate-600 py-12 italic border border-dashed border-white/5 rounded-lg">
                Click Compare to load simulation results
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}
