'use client';

import React, { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Play, Sparkles, ChevronDown } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────
interface VecCoord { word: string; coord: number[] }
interface Match { word: string; similarity: number }
interface VectorMathResult {
  word_a: string; word_b: string; word_c: string;
  op1: string; op2: string;
  math_path: number[][];
  matches: Match[];
  vocab_coords: VecCoord[];
}

// ── Presets ────────────────────────────────────────────────────────────────
const PRESETS = [
  { label: '👑 Gender (Royalty)', a: 'king',  op1: '-', b: 'man',    op2: '+', c: 'woman',  expect: 'queen'   },
  { label: '🌍 Capital Cities',   a: 'paris', op1: '-', b: 'france', op2: '+', c: 'germany',expect: 'berlin'  },
  { label: '🐾 Animal Growth',    a: 'dog',   op1: '-', b: 'puppy',  op2: '+', c: 'kitten', expect: 'cat'     },
  { label: '🎭 Profession Gender',a: 'actor', op1: '-', b: 'man',    op2: '+', c: 'woman',  expect: 'actress' },
];

const WORDS = ['king','queen','man','woman','prince','princess','paris','france','berlin',
               'germany','tokyo','japan','london','uk','father','mother','son','daughter',
               'boy','girl','dog','puppy','cat','kitten','lion','cub','actor','actress',
               'doctor','nurse','coder'];

const OPS = ['+', '-'];

// ── 3-D Canvas ─────────────────────────────────────────────────────────────
function VectorCanvas({ result }: { result: VectorMathResult | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [angleX, setAngleX] = useState(0.4);
  const [angleY, setAngleY] = useState(0.6);
  const dragging = useRef(false);
  const lastPos   = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const scale = 55;

    const project = (x: number, y: number, z: number) => {
      let x1 = x * Math.cos(angleY) - z * Math.sin(angleY);
      let z1 = x * Math.sin(angleY) + z * Math.cos(angleY);
      let y2 = y * Math.cos(angleX) - z1 * Math.sin(angleX);
      let z2 = y * Math.sin(angleX) + z1 * Math.cos(angleX);
      const d = 5 / (5 + z2);
      return { x: cx + x1 * scale * d, y: cy + y2 * scale * d, depth: z2 };
    };

    // Axes
    [
      { p: [2,0,0], c: 'rgba(239,68,68,0.3)' },
      { p: [0,2,0], c: 'rgba(34,197,94,0.3)' },
      { p: [0,0,2], c: 'rgba(59,130,246,0.3)' },
    ].forEach(({ p, c }) => {
      const o = project(0,0,0), t = project(p[0],p[1],p[2]);
      ctx.beginPath(); ctx.moveTo(o.x,o.y); ctx.lineTo(t.x,t.y);
      ctx.strokeStyle = c; ctx.lineWidth = 1.5; ctx.stroke();
    });

    if (!result) {
      // Placeholder glow
      ctx.fillStyle = 'rgba(139,92,246,0.12)';
      ctx.beginPath(); ctx.arc(cx, cy, 60, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = 'rgba(139,92,246,0.5)';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Run an equation to visualise', cx, cy);
      return;
    }

    // Vocab word dots (dim)
    const dimColor = 'rgba(100,100,160,0.4)';
    result.vocab_coords.forEach(({ word, coord }) => {
      if (!coord) return;
      const p = project(coord[0] ?? 0, coord[1] ?? 0, coord[2] ?? 0);
      ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI*2);
      ctx.fillStyle = dimColor; ctx.fill();
      ctx.fillStyle = 'rgba(150,150,200,0.5)';
      ctx.font = '7px monospace'; ctx.textAlign = 'left';
      ctx.fillText(word, p.x + 4, p.y + 3);
    });

    // Math path: origin → A → A op B → result
    const pathColors = ['#8b5cf6','#3b82f6','#f59e0b','#10b981'];
    const pathLabels = ['Origin', result.word_a.toUpperCase(), `${result.word_a} ${result.op1} ${result.word_b}`, '⭐ Result'];
    const pathPoints = result.math_path.map(c => project(c[0]??0, c[1]??0, c[2]??0));

    // Draw path arrows
    pathPoints.forEach((p, i) => {
      if (i === 0) return;
      const prev = pathPoints[i - 1];
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = pathColors[i];
      ctx.lineWidth = i === 3 ? 2.5 : 1.5;
      ctx.setLineDash(i === 3 ? [] : [4, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Draw path nodes
    pathPoints.forEach((p, i) => {
      const r = i === 3 ? 9 : 5;
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI*2);
      ctx.fillStyle = pathColors[i];
      if (i === 3) { ctx.shadowColor = '#10b981'; ctx.shadowBlur = 18; }
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff';
      ctx.font = i === 3 ? 'bold 8px monospace' : '7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(pathLabels[i], p.x, p.y - r - 3);
    });

  }, [result, angleX, angleY]);

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    setAngleY(a => a + dx * 0.012);
    setAngleX(a => a + dy * 0.012);
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  return (
    <div
      className="relative bg-black/60 rounded-2xl border border-white/5 overflow-hidden cursor-grab active:cursor-grabbing w-full"
      style={{ height: 340 }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={() => { dragging.current = false; }}
      onMouseLeave={() => { dragging.current = false; }}
    >
      <canvas ref={canvasRef} width={680} height={340} className="w-full h-full" />
      <div className="absolute top-3 left-3 text-[10px] font-mono text-slate-500 select-none">
        Drag to rotate · 3D PCA Projection
      </div>
      {result && (
        <div className="absolute top-3 right-3 flex flex-col gap-1 text-[9px] font-mono">
          {[
            { c: '#8b5cf6', l: 'Origin' },
            { c: '#3b82f6', l: result.word_a },
            { c: '#f59e0b', l: `${result.word_a} ${result.op1} ${result.word_b}` },
            { c: '#10b981', l: '⭐ Result' },
          ].map(({ c, l }) => (
            <div key={l} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c }} />
              <span className="text-slate-400">{l}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Word Select ─────────────────────────────────────────────────────────────
function WordSelect({ value, onChange, id }: { value: string; onChange: (v: string) => void; id: string }) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm font-semibold focus:outline-none focus:border-violet-500 transition-colors pr-8"
      >
        {WORDS.map(w => <option key={w} value={w}>{w}</option>)}
      </select>
      <ChevronDown className="absolute right-2 top-3.5 h-4 w-4 text-slate-500 pointer-events-none" />
    </div>
  );
}

// ── Operator Select ─────────────────────────────────────────────────────────
function OpSelect({ value, onChange, id }: { value: string; onChange: (v: string) => void; id: string }) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none w-full bg-black/50 border border-violet-500/30 rounded-xl px-4 py-3 text-violet-300 font-mono text-xl font-bold focus:outline-none focus:border-violet-400 transition-colors text-center pr-8"
      >
        {OPS.map(op => <option key={op} value={op}>{op}</option>)}
      </select>
      <ChevronDown className="absolute right-2 top-3.5 h-4 w-4 text-violet-500 pointer-events-none" />
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function VectorMathPage() {
  const [wordA, setWordA]   = useState('king');
  const [op1,   setOp1]     = useState('-');
  const [wordB, setWordB]   = useState('man');
  const [op2,   setOp2]     = useState('+');
  const [wordC, setWordC]   = useState('woman');
  const [result, setResult] = useState<VectorMathResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<number | null>(null);

  const applyPreset = (idx: number) => {
    const p = PRESETS[idx];
    setWordA(p.a); setOp1(p.op1); setWordB(p.b);
    setOp2(p.op2); setWordC(p.c);
    setActivePreset(idx);
  };

  const runAlgebra = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('http://localhost:8000/simulate/vector-math', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word_a: wordA, op1, word_b: wordB, op2, word_c: wordC }),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.detail || 'Failed');
      }
      const data: VectorMathResult = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Backend unreachable.');
    } finally {
      setLoading(false);
    }
  };

  // Similarity bar colour based on rank
  const barColor = (idx: number) =>
    idx === 0 ? 'from-emerald-600 to-teal-500'
    : idx === 1 ? 'from-violet-600 to-indigo-600'
    : 'from-slate-700 to-slate-600';

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8">

        {/* ── Header ── */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600">
              <Compass className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Semantic Vector Math Sandbox</h1>
              <p className="text-xs text-slate-400">
                Explore the geometry of meaning — perform arithmetic on word vectors and watch the results appear in 3D space.
              </p>
            </div>
          </div>
        </div>

        {/* ── Presets ── */}
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p, i) => (
            <button
              key={i}
              id={`preset-${i}`}
              onClick={() => applyPreset(i)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                activePreset === i
                  ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {p.label}
              <span className="ml-2 text-slate-500 font-mono">→ {p.expect}</span>
            </button>
          ))}
        </div>

        {/* ── Equation Builder + Canvas ── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

          {/* Left: Builder */}
          <div className="xl:col-span-4 flex flex-col gap-5">

            {/* Equation */}
            <div className="glass-panel p-5 border border-white/5 bg-black/40 rounded-2xl flex flex-col gap-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                Equation Builder
              </span>

              {/* Word A */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider" htmlFor="word-a">
                  Word A
                </label>
                <WordSelect id="word-a" value={wordA} onChange={v => { setWordA(v); setActivePreset(null); }} />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1" htmlFor="op-1">
                    Op 1
                  </label>
                  <OpSelect id="op-1" value={op1} onChange={v => { setOp1(v); setActivePreset(null); }} />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1" htmlFor="word-b">
                    Word B
                  </label>
                  <WordSelect id="word-b" value={wordB} onChange={v => { setWordB(v); setActivePreset(null); }} />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1" htmlFor="op-2">
                    Op 2
                  </label>
                  <OpSelect id="op-2" value={op2} onChange={v => { setOp2(v); setActivePreset(null); }} />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1" htmlFor="word-c">
                    Word C
                  </label>
                  <WordSelect id="word-c" value={wordC} onChange={v => { setWordC(v); setActivePreset(null); }} />
                </div>
              </div>

              {/* Equation preview */}
              <div className="p-3 rounded-xl bg-violet-950/20 border border-violet-500/15 font-mono text-sm text-center text-slate-300">
                <span className="text-violet-300 font-bold">{wordA}</span>
                <span className="mx-2 text-slate-400">{op1}</span>
                <span className="text-blue-300 font-bold">{wordB}</span>
                <span className="mx-2 text-slate-400">{op2}</span>
                <span className="text-amber-300 font-bold">{wordC}</span>
                <span className="mx-2 text-slate-400">=</span>
                <span className="text-emerald-400 font-bold animate-pulse">?</span>
              </div>

              <button
                id="run-vector-math"
                onClick={runAlgebra}
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <Play className="h-4 w-4 fill-current" />
                {loading ? 'Calculating…' : 'Solve Equation'}
              </button>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  {error}
                </div>
              )}
            </div>

            {/* Similarity Leaderboard */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="glass-panel p-5 border border-white/5 bg-black/40 rounded-2xl flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Cosine Similarity
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Top 10 matches</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {result.matches.map((m, i) => (
                      <motion.div
                        key={m.word}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex flex-col gap-0.5"
                      >
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className={`font-bold ${i === 0 ? 'text-emerald-400 text-sm' : 'text-slate-300'}`}>
                            {i === 0 && '⭐ '}{m.word}
                          </span>
                          <span className={`${i === 0 ? 'text-emerald-400' : 'text-violet-400'}`}>
                            {m.similarity.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max(0, m.similarity)}%` }}
                            transition={{ duration: 0.7, delay: i * 0.05 }}
                            className={`h-full bg-gradient-to-r ${barColor(i)} rounded-full`}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: 3D Canvas */}
          <div className="xl:col-span-8 flex flex-col gap-4">
            <VectorCanvas result={result} />

            {/* Explanation */}
            <div className="glass-panel p-5 border border-white/5 bg-black/40 rounded-2xl">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">How it works</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every word is encoded as a high-dimensional vector in a <strong className="text-white">semantic feature space</strong>.
                These features capture attributes like <em>gender, royalty, nationality, age</em>, and <em>profession</em>.
                Performing arithmetic on these vectors (<code className="text-violet-400">King − Man + Woman</code>) shifts
                the resultant vector through the space toward its closest neighbour — which turns out to be <code className="text-emerald-400">Queen</code>.
                The 3D canvas above shows the math path as a trajectory through that semantic space.
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-500">
                <div className="p-2 rounded-lg border border-white/5 bg-white/5">
                  <span className="text-violet-400 block font-bold">Dim 1</span> Gender
                </div>
                <div className="p-2 rounded-lg border border-white/5 bg-white/5">
                  <span className="text-amber-400 block font-bold">Dim 2</span> Royalty
                </div>
                <div className="p-2 rounded-lg border border-white/5 bg-white/5">
                  <span className="text-blue-400 block font-bold">Dim 3</span> Capitalness
                </div>
                <div className="p-2 rounded-lg border border-white/5 bg-white/5">
                  <span className="text-emerald-400 block font-bold">Dim 4</span> Countryness
                </div>
                <div className="p-2 rounded-lg border border-white/5 bg-white/5">
                  <span className="text-rose-400 block font-bold">Dim 5</span> Age / Size
                </div>
                <div className="p-2 rounded-lg border border-white/5 bg-white/5">
                  <span className="text-teal-400 block font-bold">Dim 6-7</span> Animality · Profession
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
