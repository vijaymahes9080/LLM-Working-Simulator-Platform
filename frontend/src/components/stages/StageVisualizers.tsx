'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Play, Pause, RotateCcw, HelpCircle, Network, Settings, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

// Helper for stage explanation panels
export const StageExplanation: React.FC<{ stage: number }> = ({ stage }) => {
  const explanations: Record<number, { title: string; formula: string; text: string; note: string }> = {
    1: {
      title: "Input Text Processing",
      formula: "Text \\to UTF-8 \\text{ Bytes}",
      text: "The raw text input is ingested by the model. Character and word counts are measured. This serves as the start of the entire generative lifecycle.",
      note: "Every prompt consumes tokens and impacts overall memory limits."
    },
    2: {
      title: "Cleaning & Normalization",
      formula: "x_{clean} = \\text{strip}(\\text{lower}(x))",
      text: "Some models clean text prior to tokenization. This includes Unicode normalization, lowercase translation, or stripping trailing spaces and special control symbols.",
      note: "Modern LLMs often skip heavy cleaning to retain original formatting details."
    },
    3: {
      title: "Subword Tokenization",
      formula: "T = \\text{Tokenizer}(x)",
      text: "Text is chopped into subword chunks (tokens). BPE (Byte Pair Encoding) merges frequent byte pairs. WordPiece matches prefixes. SentencePiece processes raw bytes directly.",
      note: "Subwords help the model handle out-of-vocabulary terms gracefully."
    },
    4: {
      title: "Token ID Mapping",
      formula: "ID_i = \\text{Vocab}[T_i]",
      text: "Tokens are mapped to integers using a pre-defined Vocabulary dictionary (e.g. GPT-2 has 50,257 tokens). These IDs are the actual numerical representations sent to the neural network.",
      note: "Unseen words are split until they resolve to valid vocabulary IDs."
    },
    5: {
      title: "Token Embedding Projection",
      formula: "E_i = \\text{Embed}(ID_i) \\in \\mathbb{R}^{d_{model}}",
      text: "Integers are converted to dense vectors of size d_model (e.g., 768 for GPT-2). This high-dimensional space groups semantically similar tokens close together.",
      note: "Hover or rotate the 3D plot to inspect vector distances."
    },
    6: {
      title: "Positional Encoding",
      formula: "PE_{(pos, 2i)} = \\sin\\left(\\frac{pos}{10000^{2i/d}}\\right)",
      text: "Because Transformers process all tokens simultaneously, they have no concept of word order. Positional vectors are added directly to the embeddings to inject token sequence coordinates.",
      note: "Sinusoidal waves generate distinct geometric shapes for each index."
    },
    7: {
      title: "Transformer Layers Routing",
      formula: "H_{l+1} = \\text{LayerNorm}(H_l + \\text{Block}(H_l))",
      text: "Token representations pass through consecutive Transformer layers (e.g., 12 in GPT2). Residual skip connections run parallel to ensure gradient flow during backward passes.",
      note: "More layers allow the model to recognize deeper syntax and contexts."
    },
    8: {
      title: "Multi-Head Attention",
      formula: "\\text{Attention}(Q,K,V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V",
      text: "Tokens compute attention weights with other tokens. Queries (what I seek), Keys (what I offer), and Values (what I represent) determine which words should focus on each other.",
      note: "Select different heads to see varied context pathways."
    },
    9: {
      title: "Feed Forward Networks (FFN)",
      formula: "\\text{FFN}(x) = \\text{GELU}(xW_1 + b_1)W_2 + b_2",
      text: "After attention, vectors pass through a Feed Forward Network (FFN). It expands token vectors (typically 4x), applies activation (GELU/ReLU), and compresses them back to d_model.",
      note: "This layer acts as the model's 'factual database' storage."
    },
    10: {
      title: "Hidden States Synthesis",
      formula: "H_{last} \\in \\mathbb{R}^{seq \\times d_{model}}",
      text: "The final representations emerging from the top layer of the Transformer. This matrix contains highly contextualized vectors containing both semantics and positional coordinates.",
      note: "This state is decoded to predict subsequent tokens."
    },
    11: {
      title: "Next Token Prediction",
      formula: "P(w) = \\text{softmax}(\\text{Logits})",
      text: "A linear layer maps the final hidden state to vocabulary dimensions, generating Logits. Applying Temperature scaling and Softmax yields probability scores for every potential next token.",
      note: "Lower temperatures generate deterministic, conservative outputs."
    },
    12: {
      title: "Autoregressive Generation",
      formula: "x_{new} = [x_1, \\dots, x_t, \\hat{x}_{t+1}]",
      text: "The top predicted token is selected and appended to the input sequence. The entire simulation loop repeats autoregressively until a stop token or length limit is hit.",
      note: "This loop drives ChatGPT and other generative text LLMs."
    }
  };

  const current = explanations[stage] || {
    title: "Processing Stage",
    formula: "",
    text: "Analyzing sequence representations.",
    note: ""
  };

  return (
    <div className="flex flex-col gap-4 text-slate-300">
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-violet-500/20 text-violet-300 text-xs font-bold">
          {stage}
        </span>
        <h3 className="font-bold text-white text-base">{current.title}</h3>
      </div>
      
      {current.formula && (
        <div className="bg-black/30 border border-white/5 rounded-lg p-3 font-mono text-xs text-violet-400 overflow-x-auto">
          {current.formula}
        </div>
      )}
      
      <p className="text-sm leading-relaxed text-slate-400">{current.text}</p>
      
      {current.note && (
        <div className="mt-2 p-3 bg-blue-950/10 border border-blue-500/15 rounded-lg text-xs text-slate-400 flex gap-2">
          <HelpCircle className="h-4 w-4 text-blue-400 shrink-0" />
          <span>{current.note}</span>
        </div>
      )}
    </div>
  );
};

// 1. INPUT STAGE VISUALIZER
export const InputStage: React.FC<{ data: any }> = ({ data }) => {
  if (!data) return <div className="text-slate-500">No input processed.</div>;
  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 bg-black/40 rounded-xl border border-white/5 font-mono text-sm break-all leading-relaxed text-violet-300">
        {data.text}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-center">
          <span className="text-xs text-slate-500 block">Characters</span>
          <span className="text-xl font-bold text-white">{data.char_count}</span>
        </div>
        <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-center">
          <span className="text-xs text-slate-500 block">Words</span>
          <span className="text-xl font-bold text-white">{data.word_count}</span>
        </div>
        <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-center">
          <span className="text-xs text-slate-500 block">Normalization</span>
          <span className="text-xs font-semibold text-emerald-400 block mt-1">UTF-8 Raw</span>
        </div>
      </div>
    </div>
  );
};

// 2. CLEANING STAGE VISUALIZER
export const CleaningStage: React.FC<{ data: any }> = ({ data }) => {
  if (!data) return <div className="text-slate-500">No cleaning details.</div>;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Cleaned & Normalized Output</span>
        <div className="p-4 bg-black/40 rounded-xl border border-white/5 font-mono text-sm text-slate-300">
          {data.cleaned}
        </div>
      </div>
      <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-xs text-slate-400">
        <p className="font-semibold text-white mb-1">Normalization rules applied:</p>
        <ul className="list-disc pl-4 flex flex-col gap-1">
          <li>Lowercase capitalization folding</li>
          <li>Removed leading/trailing padding whitespace</li>
          <li>Retained letters, numbers, and basic punctuation</li>
        </ul>
      </div>
    </div>
  );
};

// 3. TOKENIZATION STAGE VISUALIZER
export const TokenizationStage: React.FC<{ data: any }> = ({ data }) => {
  if (!data || !data.tokens) return <div className="text-slate-500">No tokens found.</div>;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2 p-4 bg-black/40 rounded-xl border border-white/5 min-h-[100px] items-center">
        {data.tokens.map((token: any, idx: number) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            key={idx}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600/10 to-indigo-600/10 border border-violet-500/20 text-sm font-mono text-violet-300 flex flex-col items-center gap-0.5"
          >
            <span className="text-white font-medium">{token.text}</span>
            <span className="text-[10px] text-slate-500">idx: {idx}</span>
          </motion.div>
        ))}
      </div>
      <div className="flex justify-between items-center text-xs text-slate-400 bg-white/5 p-3 rounded-lg border border-white/5">
        <span>Tokenizer Model: <strong className="text-white">{data.method}</strong></span>
        <span>Total Token Count: <strong className="text-violet-400">{data.tokens.length}</strong></span>
      </div>
    </div>
  );
};

// 4. TOKEN IDs STAGE VISUALIZER
export const TokenIdsStage: React.FC<{ data: any }> = ({ data }) => {
  const [searchQuery, setSearchQuery] = useState('');
  if (!data || !data.token_ids) return <div className="text-slate-500">No ids found.</div>;

  const samples = data.vocabulary_sample || [];
  const filteredSamples = samples.filter((s: any) =>
    s.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id.toString().includes(searchQuery)
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Token ID table */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {data.token_ids.map((id: number, idx: number) => {
          const matchingToken = samples[idx]?.token || `t_${idx}`;
          return (
            <motion.div
              initial={{ rotateX: 90 }}
              animate={{ rotateX: 0 }}
              key={idx}
              className="bg-black/40 border border-white/5 p-3 rounded-lg flex flex-col items-center gap-1 font-mono"
            >
              <span className="text-slate-400 text-xs truncate max-w-full">"{matchingToken}"</span>
              <span className="text-xl font-bold text-violet-400">{id}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Vocab search */}
      <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col gap-3">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Vocabulary Reference Lookup</span>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tokens or IDs..."
            className="w-full bg-black/40 border border-white/10 rounded-lg py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-violet-500 text-white"
          />
        </div>

        <div className="max-h-[120px] overflow-y-auto flex flex-col gap-1">
          {filteredSamples.length > 0 ? (
            filteredSamples.map((s: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center text-xs font-mono py-1 border-b border-white/5 text-slate-400">
                <span>"{s.token}"</span>
                <span className="text-violet-300">{s.id}</span>
              </div>
            ))
          ) : (
            <span className="text-slate-600 text-xs italic">No matching vocabulary found</span>
          )}
        </div>
      </div>
    </div>
  );
};

// 5. EMBEDDINGS STAGE VISUALIZER (3D rotation canvas)
export const EmbeddingsStage: React.FC<{ data: any }> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [angleX, setAngleX] = useState(0.5);
  const [angleY, setAngleY] = useState(0.5);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const coords = data?.pca_coords || [];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || coords.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const scale = 50;

      // Draw 3D axis
      const project = (x: number, y: number, z: number) => {
        // Rotate around Y axis
        let x1 = x * Math.cos(angleY) - z * Math.sin(angleY);
        let z1 = x * Math.sin(angleY) + z * Math.cos(angleY);
        // Rotate around X axis
        let y2 = y * Math.cos(angleX) - z1 * Math.sin(angleX);
        let z2 = y * Math.sin(angleX) + z1 * Math.cos(angleX);

        // Perspective projection
        const dist = 5.0;
        const proj = dist / (dist + z2);
        return {
          x: cx + x1 * scale * proj,
          y: cy + y2 * scale * proj,
          depth: z2
        };
      };

      // Draw grid planes or axes
      const axes = [
        { x: 2, y: 0, z: 0, color: 'rgba(239, 68, 68, 0.4)' }, // X Red
        { x: 0, y: 2, z: 0, color: 'rgba(34, 197, 94, 0.4)' }, // Y Green
        { x: 0, y: 0, z: 2, color: 'rgba(59, 130, 246, 0.4)' }  // Z Blue
      ];

      axes.forEach(axis => {
        const origin = project(0, 0, 0);
        const tip = project(axis.x, axis.y, axis.z);
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(tip.x, tip.y);
        ctx.strokeStyle = axis.color;
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Project and store coordinates with depth sorting
      const projected = coords.map((c: number[], idx: number) => {
        const x = c[0] || 0;
        const y = c[1] || 0;
        const z = c[2] || 0;
        return {
          ...project(x, y, z),
          index: idx
        };
      });

      // Sort by depth (back to front)
      projected.sort((a: any, b: any) => b.depth - a.depth);

      // Draw lines connecting sequential tokens
      ctx.beginPath();
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        // find visual order connection
        if (i === 0) {
          ctx.moveTo(p.x, p.y);
        } else {
          ctx.lineTo(p.x, p.y);
        }
      }
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw nodes
      projected.forEach((p: any) => {
        const rad = Math.max(3, 8 - p.depth * 2);
        // Gradient color based on depth
        ctx.beginPath();
        ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${260 + p.depth * 20}, 80%, 65%, ${Math.max(0.4, 1 - p.depth * 0.2)})`;
        ctx.shadowColor = 'rgba(139, 92, 246, 0.5)';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '9px monospace';
        ctx.fillText(`T_${p.index}`, p.x + rad + 2, p.y + 3);
      });
    };

    render();
  }, [coords, angleX, angleY]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setAngleY(prev => prev + dx * 0.01);
    setAngleX(prev => prev + dy * 0.01);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  if (!data || coords.length === 0) return <div className="text-slate-500">No embedding data.</div>;

  return (
    <div className="flex flex-col gap-4 items-center">
      <span className="text-xs text-slate-400 text-center block">Drag inside coordinates to rotate PCA Vector Projection Space (3D)</span>
      <div 
        className="relative bg-black/60 rounded-xl border border-white/5 cursor-grab active:cursor-grabbing overflow-hidden w-full max-w-sm flex justify-center"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        <canvas ref={canvasRef} width={320} height={200} className="w-[320px] h-[200px]" />
      </div>
    </div>
  );
};

// 6. POSITIONAL ENCODING STAGE VISUALIZER
export const PositionalEncodingStage: React.FC<{ data: any }> = ({ data }) => {
  if (!data || !data.encoding_slice) return <div className="text-slate-500">No positional encoding found.</div>;
  
  const dim = 5; // display first 5 dimensions
  const slice = data.encoding_slice;

  return (
    <div className="flex flex-col gap-4">
      {/* Waveform representation SVG */}
      <div className="bg-black/40 border border-white/5 rounded-xl p-4">
        <svg viewBox="0 0 400 150" className="w-full h-auto">
          {/* Grid lines */}
          <line x1="20" y1="75" x2="380" y2="75" stroke="rgba(255,255,255,0.1)" strokeDasharray="4" />
          
          {/* Draw Waves */}
          {[0, 1, 2].map((dimIdx) => {
            const points = slice.map((enc: number[], pos: number) => {
              const x = 30 + (pos / (slice.length - 1 || 1)) * 340;
              const val = enc[dimIdx] || 0;
              const y = 75 - val * 55; // scale factor
              return `${x},${y}`;
            }).join(' ');

            const colors = ['#8b5cf6', '#3b82f6', '#10b981'];
            return (
              <g key={dimIdx}>
                <polyline
                  fill="none"
                  stroke={colors[dimIdx]}
                  strokeWidth="2"
                  points={points}
                  className="transition-all duration-300"
                />
                {/* Points */}
                {slice.map((enc: number[], pos: number) => {
                  const x = 30 + (pos / (slice.length - 1 || 1)) * 340;
                  const val = enc[dimIdx] || 0;
                  const y = 75 - val * 55;
                  return (
                    <circle
                      key={pos}
                      cx={x}
                      cy={y}
                      r="3"
                      fill={colors[dimIdx]}
                      className="cursor-pointer hover:r-5 transition-all"
                    >
                      <title>Pos: {pos}, Dim: {dimIdx}, Val: {val.toFixed(3)}</title>
                    </circle>
                  );
                })}
              </g>
            );
          })}
        </svg>
        <div className="flex justify-center gap-4 text-xs font-mono mt-2">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-violet-500 rounded-full inline-block"></span>Dim 0</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-blue-500 rounded-full inline-block"></span>Dim 2</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block"></span>Dim 4</span>
        </div>
      </div>

      <div className="text-xs text-slate-400 bg-white/5 p-3 rounded-lg border border-white/5 font-mono">
        <strong>Position Vector Merge:</strong> Embedding Vector + Positional Wave = Layer Input Representation
      </div>
    </div>
  );
};

// 7. TRANSFORMER STAGE VISUALIZER
export const TransformerStage: React.FC<{ data: any }> = ({ data }) => {
  const [activeLayer, setActiveLayer] = useState(0);
  const layersCount = data?.num_layers || 6;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {Array.from({ length: layersCount }).map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveLayer(i)}
            className={`px-3 py-1.5 text-xs font-bold font-mono rounded-lg border shrink-0 transition-colors ${
              activeLayer === i
                ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                : 'bg-black/20 border-white/5 text-slate-400 hover:text-white'
            }`}
          >
            Layer {i + 1}
          </button>
        ))}
      </div>

      {/* Interactive layer flow diagram */}
      <div className="glass-panel p-5 bg-black/40 border border-white/5 flex flex-col gap-4">
        <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
          <span>Layer {activeLayer + 1} Architecture</span>
          <span className="text-violet-400">Encoder / Decoder Block</span>
        </div>

        {/* Attention block */}
        <div className="p-3 bg-violet-950/20 border border-violet-500/20 rounded-lg flex flex-col gap-1.5 relative overflow-hidden">
          <div className="absolute right-2 top-2"><Network className="h-4 w-4 text-violet-400/40" /></div>
          <span className="text-xs font-bold text-white">Multi-Head Self-Attention Block</span>
          <span className="text-[11px] text-slate-400">Computes context relationships queries (Q), keys (K) and values (V)</span>
        </div>

        <div className="flex justify-center"><ChevronRight className="h-4 w-4 text-slate-600 rotate-90" /></div>

        {/* Residual block */}
        <div className="p-2 border border-dashed border-white/10 rounded-lg text-center text-xs text-slate-400">
          Residual Add & LayerNorm
        </div>

        <div className="flex justify-center"><ChevronRight className="h-4 w-4 text-slate-600 rotate-90" /></div>

        {/* Feed Forward Network Block */}
        <div className="p-3 bg-blue-950/20 border border-blue-500/20 rounded-lg flex flex-col gap-1.5 relative overflow-hidden">
          <div className="absolute right-2 top-2"><Settings className="h-4 w-4 text-blue-400/40" /></div>
          <span className="text-xs font-bold text-white">Feed Forward Network (FFN)</span>
          <span className="text-[11px] text-slate-400">Applies point-wise linear transformations and non-linear (GELU) scaling</span>
        </div>

        <div className="flex justify-center"><ChevronRight className="h-4 w-4 text-slate-600 rotate-90" /></div>

        {/* Layer output */}
        <div className="p-2 border border-dashed border-white/10 rounded-lg text-center text-xs text-slate-400">
          Residual Add & LayerNorm → State Layer {activeLayer + 2}
        </div>
      </div>
    </div>
  );
};

// 8. ATTENTION STAGE VISUALIZER (Interactive heatmap & hovering relations)
export const AttentionStage: React.FC<{ data: any }> = ({ data }) => {
  const [selectedHead, setSelectedHead] = useState(0);
  const [hoveredTokenIdx, setHoveredTokenIdx] = useState<number | null>(null);

  if (!data || !data.attention_heads) return <div className="text-slate-500">No attention matrix found.</div>;

  const tokens = data.tokens || [];
  const heads = data.attention_heads; // [heads, seq, seq]
  const currentMatrix = heads[selectedHead] || [];

  return (
    <div className="flex flex-col gap-4">
      {/* Head Selector tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {heads.map((_: any, idx: number) => (
          <button
            key={idx}
            onClick={() => setSelectedHead(idx)}
            className={`px-3 py-1.5 text-xs font-bold font-mono rounded-lg border shrink-0 transition-colors ${
              selectedHead === idx
                ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                : 'bg-black/20 border-white/5 text-slate-400 hover:text-white'
            }`}
          >
            Head {idx + 1}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Heatmap Matrix */}
        <div className="md:col-span-8 flex justify-center overflow-x-auto">
          <div className="flex flex-col gap-1 p-2 bg-black/40 border border-white/5 rounded-xl">
            {/* Column labels */}
            <div className="flex gap-1 pl-12">
              {tokens.map((t: string, idx: number) => (
                <div key={idx} className="w-10 text-[9px] font-mono text-center text-slate-500 truncate rotate-45 transform origin-bottom-left h-8">
                  {t}
                </div>
              ))}
            </div>

            {/* Matrix rows */}
            {tokens.map((rowToken: string, rowIdx: number) => (
              <div key={rowIdx} className="flex gap-1 items-center">
                {/* Row label */}
                <div className="w-12 text-[10px] font-mono text-right text-slate-400 truncate pr-2">
                  {rowToken}
                </div>

                {tokens.map((colToken: string, colIdx: number) => {
                  const weight = currentMatrix[rowIdx]?.[colIdx] || 0;
                  // Color scale purple
                  const colorStyle = {
                    backgroundColor: `rgba(139, 92, 246, ${weight * 1.5})`,
                    borderColor: hoveredTokenIdx === rowIdx || hoveredTokenIdx === colIdx ? 'rgba(139, 92, 246, 0.8)' : 'rgba(255, 255, 255, 0.05)'
                  };
                  return (
                    <div
                      key={colIdx}
                      style={colorStyle}
                      onMouseEnter={() => setHoveredTokenIdx(rowIdx)}
                      onMouseLeave={() => setHoveredTokenIdx(null)}
                      className="w-10 h-10 rounded border flex items-center justify-center text-[8px] font-mono text-white/50 cursor-help transition-all duration-200"
                      title={`"${rowToken}" attends to "${colToken}" weight: ${(weight * 100).toFixed(1)}%`}
                    >
                      {weight > 0.05 ? `${(weight * 100).toFixed(0)}%` : ''}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Interactive hover inspector */}
        <div className="md:col-span-4 flex flex-col gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attention Weights</span>
          {hoveredTokenIdx !== null ? (
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col gap-2 font-mono text-xs">
              <span className="text-white font-bold">Focus: "{tokens[hoveredTokenIdx]}"</span>
              <div className="flex flex-col gap-1.5 mt-1 max-h-[140px] overflow-y-auto">
                {tokens.map((t: string, idx: number) => {
                  const wt = currentMatrix[hoveredTokenIdx]?.[idx] || 0;
                  return (
                    <div key={idx} className="flex justify-between items-center py-0.5 border-b border-white/5 text-slate-400">
                      <span>to "{t}"</span>
                      <span className="text-violet-400 font-bold">{(wt * 100).toFixed(1)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-center text-xs text-slate-500 italic">
              Hover over matrix cells to inspect focused words
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 9. FEED FORWARD STAGE VISUALIZER
export const FeedForwardStage: React.FC<{ data: any }> = ({ data }) => {
  if (!data) return <div className="text-slate-500">No FFN dimensions.</div>;

  const inDim = data.ff_in_dim || 128;
  const hidDim = data.ff_hidden_dim || 512;
  const neurons = data.neurons_active || [];

  return (
    <div className="flex flex-col gap-4">
      {/* Node flow diagram */}
      <div className="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
          <span>Vector Dimension: <strong className="text-white">{inDim}</strong></span>
          <span>FFN Expanded: <strong className="text-violet-400">{hidDim}</strong></span>
        </div>

        {/* Interactive nodes drawing */}
        <div className="h-28 relative flex items-center justify-between px-6 border-y border-white/5 py-2">
          {/* Input Layer */}
          <div className="flex flex-col gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-3.5 h-3.5 rounded-full bg-blue-500 glow-blue" />
            ))}
          </div>

          <div className="h-0.5 border-t border-dashed border-white/10 flex-grow mx-4"></div>

          {/* Hidden Activated Layer */}
          <div className="flex flex-col gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="w-3.5 h-3.5 rounded-full bg-violet-500 glow-purple animate-pulse" />
            ))}
          </div>

          <div className="h-0.5 border-t border-dashed border-white/10 flex-grow mx-4"></div>

          {/* Output Layer */}
          <div className="flex flex-col gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-3.5 h-3.5 rounded-full bg-indigo-500" />
            ))}
          </div>
        </div>

        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>d_model (Input)</span>
          <span>4 * d_model (GELU Activation)</span>
          <span>d_model (Output)</span>
        </div>
      </div>
    </div>
  );
};

// 10. HIDDEN STATES STAGE VISUALIZER
export const HiddenStatesStage: React.FC<{ data: any }> = ({ data }) => {
  if (!data || !data.states_slice) return <div className="text-slate-500">No hidden states outputs.</div>;

  return (
    <div className="flex flex-col gap-4">
      {/* Node graph of layer outputs */}
      <div className="grid grid-cols-1 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
        {data.states_slice.map((state: number[], idx: number) => (
          <div key={idx} className="bg-black/40 border border-white/5 rounded-lg p-3 flex justify-between items-center font-mono text-xs">
            <span className="text-slate-400">Token {idx} Hidden Representation:</span>
            <div className="flex gap-1 max-w-[200px] overflow-x-auto text-[10px] text-violet-300">
              [{state.slice(0, 4).map(v => v.toFixed(3)).join(', ')}, ...]
            </div>
          </div>
        ))}
      </div>
      <div className="text-xs text-slate-500 bg-white/5 p-3 rounded-lg border border-white/5">
        Hidden states represent context-rich arrays that contain the full lexical and structural mapping of the prompt.
      </div>
    </div>
  );
};

// 11. NEXT TOKEN PREDICTION VISUALIZER (Probability chart)
export const PredictionStage: React.FC<{ data: any }> = ({ data }) => {
  if (!data || !data.probabilities) return <div className="text-slate-500">No probability distribution yet.</div>;

  const probs = data.probabilities;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 bg-black/40 border border-white/5 p-4 rounded-xl">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Next Token Probabilities (Top 5)</span>
        <div className="flex flex-col gap-2.5">
          {probs.map((p: any, idx: number) => (
            <div key={idx} className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-white font-bold">"{p.token}"</span>
                <span className="text-violet-400 font-bold">{p.probability}%</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${p.probability}%` }}
                  transition={{ duration: 0.8, delay: idx * 0.1 }}
                  className="h-full bg-gradient-to-r from-violet-600 to-indigo-600"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 12. GENERATION STAGE VISUALIZER
export const GenerationStage: React.FC<{ data: any }> = ({ data }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [typedText, setTypedText] = useState('');
  const textVal = data?.generated_text || '';

  useEffect(() => {
    if (!textVal || !isPlaying) return;
    
    let idx = 0;
    const words = textVal.split(' ');
    setTypedText('');

    const interval = setInterval(() => {
      if (idx < words.length) {
        setTypedText(prev => prev + (prev ? ' ' : '') + words[idx]);
        idx++;
      } else {
        clearInterval(interval);
        setIsPlaying(false);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [textVal, isPlaying]);

  if (!data) return <div className="text-slate-500">No output generated.</div>;

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="flex gap-2 items-center justify-between">
        <span className="text-xs text-slate-500 uppercase font-bold font-mono">Autoregressive Loop</span>
        <div className="flex gap-1.5">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-slate-300 hover:text-white cursor-pointer hover:bg-white/10"
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={() => {
              setTypedText('');
              setIsPlaying(true);
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-slate-300 hover:text-white cursor-pointer hover:bg-white/10"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Replay
          </button>
        </div>
      </div>

      {/* Screen console display */}
      <div className="p-5 bg-black/60 rounded-xl border border-white/5 font-mono text-sm leading-relaxed text-emerald-400 min-h-[100px] shadow-inner relative overflow-hidden">
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
        {typedText}
        <span className="inline-block w-1.5 h-4 bg-emerald-400 ml-1 animate-ping"></span>
      </div>
    </div>
  );
};
