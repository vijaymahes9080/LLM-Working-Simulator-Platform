'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useSimulation } from '@/hooks/useSimulation';
import { API_BASE_URL } from '@/config';
import {
  InputStage,
  CleaningStage,
  TokenizationStage,
  TokenIdsStage,
  EmbeddingsStage,
  PositionalEncodingStage,
  TransformerStage,
  AttentionStage,
  FeedForwardStage,
  HiddenStatesStage,
  PredictionStage,
  GenerationStage,
  StageExplanation
} from '@/components/stages/StageVisualizers';
import {
  Settings,
  Sliders,
  Play,
  Download,
  Share2,
  AlertCircle,
  HelpCircle,
  Code
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PipelinePage() {
  const { isAuthenticated, token } = useAuth();
  const {
    stagesData,
    currentActiveStage,
    setCurrentActiveStage,
    startSimulation,
    loading,
    streaming,
    error
  } = useSimulation();

  // Parameter states
  const [prompt, setPrompt] = useState('What is Java Microservices?');
  const [model, setModel] = useState('distilgpt2');
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);
  const [topK, setTopK] = useState(50);
  const [tokenizationMethod, setTokenizationMethod] = useState('BPE');
  const [positionalEncoding, setPositionalEncoding] = useState('Sinusoidal');
  const [numLayers, setNumLayers] = useState(6);
  const [tokenLimit, setTokenLimit] = useState(15);
  const [showSettings, setShowSettings] = useState(false);

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    startSimulation(prompt, {
      model_name: model,
      temperature,
      top_p: topP,
      top_k: topK,
      tokenization_method: tokenizationMethod,
      positional_encoding: positionalEncoding,
      num_layers: numLayers,
      token_limit: tokenLimit
    });
  };

  const handleExport = async (format: 'json' | 'pdf') => {
    if (Object.keys(stagesData).length === 0) return;
    
    // Assemble all raw data for backend export
    const payload = {
      prompt,
      model_name: model,
      created_at: new Date().toLocaleString(),
      tokens: stagesData[3]?.data?.tokens || [],
      output_text: stagesData[12]?.data?.generated_text || '',
    };

    try {
      const response = await fetch(`${API_BASE_URL}/simulate/export/${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `simulation_report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      // Offline fallback
      if (format === 'json') {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
        const link = document.createElement('a');
        link.href = dataStr;
        link.setAttribute('download', 'simulation_report.json');
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
      } else {
        alert('Could not export PDF. Please check if backend service is running.');
      }
    }
  };

  // Render the matching component for current active stage
  const renderVisualizer = () => {
    const stageData = stagesData[currentActiveStage]?.data;
    switch (currentActiveStage) {
      case 1: return <InputStage data={stageData} />;
      case 2: return <CleaningStage data={stageData} />;
      case 3: return <TokenizationStage data={stageData} />;
      case 4: return <TokenIdsStage data={stageData} />;
      case 5: return <EmbeddingsStage data={stageData} />;
      case 6: return <PositionalEncodingStage data={stageData} />;
      case 7: return <TransformerStage data={stageData} />;
      case 8: return <AttentionStage data={stageData} />;
      case 9: return <FeedForwardStage data={stageData} />;
      case 10: return <HiddenStatesStage data={stageData} />;
      case 11: return <PredictionStage data={stageData} />;
      case 12: return <GenerationStage data={stageData} />;
      default: return <div className="text-slate-500">Select a stage to view.</div>;
    }
  };

  const stagesList = [
    { num: 1, name: 'Input processing' },
    { num: 2, name: 'Cleaning & Normalization' },
    { num: 3, name: 'Tokenization' },
    { num: 4, name: 'Token IDs' },
    { num: 5, name: 'Embeddings' },
    { num: 6, name: 'Positional Encoding' },
    { num: 7, name: 'Transformer Block' },
    { num: 8, name: 'Self Attention' },
    { num: 9, name: 'Feed Forward Network' },
    { num: 10, name: 'Hidden States' },
    { num: 11, name: 'Prediction probabilities' },
    { num: 12, name: 'Autoregressive Output' }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Main workspace */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        
        {/* Prompt Input Form */}
        <div className="glass-panel p-5 bg-black/40 border border-white/5 flex flex-col gap-4">
          <form onSubmit={handleSimulate} className="flex gap-3">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter custom prompt (e.g., 'What is Java Microservices?')"
              className="flex-grow bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 text-white placeholder-slate-500 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className={`p-3 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                showSettings 
                  ? 'bg-violet-600/20 border-violet-500 text-violet-300' 
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
              title="Simulator Settings"
            >
              <Sliders className="h-5 w-5" />
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Play className="h-4 w-4 fill-current" />
              {loading ? 'Running...' : 'Simulate'}
            </button>
          </form>

          {/* Collapsible Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-white/5 pt-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs"
              >
                {/* Param 1: Model selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-400 uppercase tracking-wider">Model</label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="bg-black/40 border border-white/10 rounded-lg p-2 focus:outline-none focus:border-violet-500 text-white"
                  >
                    <option value="distilgpt2">DistilGPT-2 (Fastest)</option>
                    <option value="gpt2">GPT-2 (Standard)</option>
                    <option value="bert-base">BERT-Base (Encoder)</option>
                    <option value="llama-tiny-sim">Llama 3 (Simulated)</option>
                  </select>
                </div>

                {/* Param 2: Tokenizer method */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-400 uppercase tracking-wider">Tokenizer</label>
                  <select
                    value={tokenizationMethod}
                    onChange={(e) => setTokenizationMethod(e.target.value)}
                    className="bg-black/40 border border-white/10 rounded-lg p-2 focus:outline-none focus:border-violet-500 text-white"
                  >
                    <option value="BPE">BPE (Byte Pair)</option>
                    <option value="WordPiece">WordPiece (BERT)</option>
                    <option value="SentencePiece">SentencePiece (Llama/T5)</option>
                  </select>
                </div>

                {/* Param 3: Positional Encoding */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-400 uppercase tracking-wider">Positional Encoding</label>
                  <select
                    value={positionalEncoding}
                    onChange={(e) => setPositionalEncoding(e.target.value)}
                    className="bg-black/40 border border-white/10 rounded-lg p-2 focus:outline-none focus:border-violet-500 text-white"
                  >
                    <option value="Sinusoidal">Sinusoidal Waves</option>
                    <option value="Rotary">Rotary Embeddings (RoPE)</option>
                  </select>
                </div>

                {/* Param 4: Layers */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-400 uppercase tracking-wider">Layers</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={numLayers}
                    onChange={(e) => setNumLayers(parseInt(e.target.value))}
                    className="bg-black/40 border border-white/10 rounded-lg p-2 focus:outline-none focus:border-violet-500 text-white"
                  />
                </div>

                {/* Slider: Temperature */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between">
                    <label className="font-bold text-slate-400 uppercase tracking-wider">Temperature</label>
                    <span className="text-violet-400 font-mono">{temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.5"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="accent-violet-500"
                  />
                </div>

                {/* Slider: Top-P */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between">
                    <label className="font-bold text-slate-400 uppercase tracking-wider">Top-P (Nucleus)</label>
                    <span className="text-violet-400 font-mono">{topP}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={topP}
                    onChange={(e) => setTopP(parseFloat(e.target.value))}
                    className="accent-violet-500"
                  />
                </div>

                {/* Slider: Top-K */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between">
                    <label className="font-bold text-slate-400 uppercase tracking-wider">Top-K</label>
                    <span className="text-violet-400 font-mono">{topK}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    step="1"
                    value={topK}
                    onChange={(e) => setTopK(parseInt(e.target.value))}
                    className="accent-violet-500"
                  />
                </div>

                {/* Slider: Max Tokens */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between">
                    <label className="font-bold text-slate-400 uppercase tracking-wider">Max New Tokens</label>
                    <span className="text-violet-400 font-mono">{tokenLimit}</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={tokenLimit}
                    onChange={(e) => setTokenLimit(parseInt(e.target.value))}
                    className="accent-violet-500"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error panel */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex gap-2 items-center">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Triple Grid layout: Left-Center-Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Column 1: Stage Navigator (3 cols) */}
          <div className="lg:col-span-3 flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Stage Navigator</span>
            <div className="flex flex-col gap-1">
              {stagesList.map((stage) => {
                const isLoaded = !!stagesData[stage.num];
                const isActive = currentActiveStage === stage.num;
                return (
                  <button
                    key={stage.num}
                    onClick={() => setCurrentActiveStage(stage.num)}
                    className={`text-left px-3.5 py-2.5 rounded-xl border text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                      isActive
                        ? 'bg-violet-600/20 border-violet-500 text-violet-300 shadow-md font-bold'
                        : isLoaded
                        ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                        : 'bg-black/10 border-white/5 text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isActive ? 'bg-violet-500 text-white' : isLoaded ? 'bg-violet-950/40 text-violet-300' : 'bg-black/40 text-slate-600'
                      }`}>
                        {stage.num}
                      </span>
                      <span className="truncate">{stage.name}</span>
                    </div>
                    {isLoaded && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-emerald-500 shadow-sm" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Column 2: Visualizer (6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-3">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Live Visualization</span>
              
              {/* Export options */}
              {Object.keys(stagesData).length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExport('json')}
                    className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 px-2 py-1 rounded-md transition-colors cursor-pointer"
                  >
                    <Download className="h-3 w-3" />
                    JSON
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 px-2 py-1 rounded-md transition-colors cursor-pointer"
                  >
                    <Share2 className="h-3 w-3" />
                    PDF Report
                  </button>
                </div>
              )}
            </div>

            <div className="glass-panel p-6 bg-black/40 border border-white/5 min-h-[340px] flex flex-col justify-center">
              {renderVisualizer()}
            </div>
          </div>

          {/* Column 3: Explanation (3 cols) */}
          <div className="lg:col-span-3 flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Scientific Guide</span>
            <div className="glass-panel p-5 bg-black/40 border border-white/5 min-h-[300px]">
              <StageExplanation stage={currentActiveStage} />
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
