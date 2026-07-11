'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Cpu, ArrowRight, Play, Sparkles, BookOpen, Layers, Lock, Mail, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const router = useRouter();
  const { login, setGuestMode, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/pipeline');
    }
  }, [isAuthenticated, router]);

  // Demo tokens for landing animation
  const demoWords = ['What', 'is', 'Java', 'Micro', 'services'];
  const [activeWordIdx, setActiveWordIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveWordIdx((prev) => (prev + 1) % demoWords.length);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    const endpoint = isRegistering ? 'register' : 'login';

    try {
      const response = await fetch(`http://localhost:8000/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }

      login(data.access_token, data.email, data.role);
      router.push('/pipeline');
    } catch (err: any) {
      setError(err.message || 'Connection to backend failed. Try guest mode.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAccess = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8000/auth/guest', {
        method: 'POST',
      });
      const data = await response.json();
      if (!response.ok) throw new Error('Guest mode failed');

      setGuestMode(data.access_token, data.email);
      router.push('/pipeline');
    } catch (err) {
      // Fallback for completely local simulation in case backend is offline
      const mockToken = 'mock_guest_token_' + Date.now();
      setGuestMode(mockToken, 'guest_offline@llminside.local');
      router.push('/pipeline');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Visual highlights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10">
        
        {/* Left column: Presentation & Simulation Flow */}
        <div className="lg:col-span-7 flex flex-col gap-6 text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 w-fit">
            <Sparkles className="h-4 w-4 text-violet-400" />
            <span className="text-xs font-semibold text-violet-300 uppercase tracking-widest">Interactive AI Simulator</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Understand How <br/>
            <span className="text-gradient">LLMs Think</span>
          </h1>

          <p className="text-lg text-slate-400 max-w-xl">
            Type custom text and explore every internal stage of a Large Language Model visually, from tokenizer partitions up to attention maps and output probabilities.
          </p>

          {/* Dynamic Animation Widget */}
          <div className="glass-panel p-6 border border-white/5 bg-[#0a0a14]/60 max-w-xl mt-4">
            <div className="flex flex-col gap-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Live Pipeline Flow</span>
              
              {/* Step 1: Input text */}
              <div className="flex items-center justify-between text-sm bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                <span className="text-slate-400 font-mono">Sentence</span>
                <span className="text-white font-semibold">"What is Java Microservices?"</span>
              </div>
              
              <div className="flex justify-center"><ArrowRight className="h-4 w-4 text-violet-500 rotate-90" /></div>

              {/* Step 2: Tokens */}
              <div className="flex items-center justify-between text-sm bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                <span className="text-slate-400 font-mono">Tokens</span>
                <div className="flex gap-1.5 flex-wrap">
                  {demoWords.map((word, idx) => (
                    <motion.span
                      key={idx}
                      animate={{
                        scale: activeWordIdx === idx ? 1.05 : 1,
                        backgroundColor: activeWordIdx === idx ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        borderColor: activeWordIdx === idx ? 'rgba(139, 92, 246, 0.4)' : 'rgba(255, 255, 255, 0.05)'
                      }}
                      className="px-2 py-0.5 rounded border text-xs font-mono text-violet-300"
                    >
                      {word}
                    </motion.span>
                  ))}
                </div>
              </div>

              <div className="flex justify-center"><ArrowRight className="h-4 w-4 text-violet-500 rotate-90" /></div>

              {/* Step 3: Attention Weight */}
              <div className="flex items-center justify-between text-sm bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                <span className="text-slate-400 font-mono">Attention Matrix</span>
                <div className="flex gap-1">
                  {demoWords.map((_, i) => (
                    <div key={i} className="flex flex-col gap-1">
                      {demoWords.map((_, j) => {
                        const intensity = (i + j + activeWordIdx) % 4;
                        const bgColors = ['bg-violet-950/20', 'bg-violet-900/40', 'bg-violet-700/60', 'bg-violet-500'];
                        return <div key={j} className={`w-3.5 h-3.5 rounded-sm ${bgColors[intensity]} transition-colors duration-500`} />;
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Auth form */}
        <div className="lg:col-span-5 w-full flex justify-center">
          <div className="glass-panel w-full max-w-md p-8 border border-white/5 bg-[#0a0a14]/80 glow-purple">
            <div className="flex flex-col items-center mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 mb-3">
                <Cpu className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                {isRegistering ? 'Create Account' : 'Welcome Laboratory'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your credentials or choose guest mode to begin.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleAuth} className="flex flex-col gap-4">
              <div className="relative">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-violet-500 text-white placeholder-slate-600 transition-colors"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Password</label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-violet-500 text-white placeholder-slate-600 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Processing...' : isRegistering ? 'Register' : 'Login'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-white/5"></div>
              <span className="flex-shrink mx-4 text-xs font-bold text-slate-500 uppercase tracking-widest">or</span>
              <div className="flex-grow border-t border-white/5"></div>
            </div>

            <button
              onClick={handleGuestAccess}
              disabled={loading}
              className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Play className="h-4 w-4 text-violet-400" />
              Enter Guest Mode (Instant)
            </button>

            <div className="text-center mt-6">
              <button
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
              >
                {isRegistering ? 'Already have an account? Log In' : "Don't have an account? Register"}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
