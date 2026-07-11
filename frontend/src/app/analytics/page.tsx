'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { BarChart2, Shield, Users, HelpCircle, Activity, Zap } from 'lucide-react';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/analytics/dashboard')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        // Fallback offline simulation data
        setData({
          total_users: 12,
          total_sessions: 148,
          total_tokens_simulated: 3840,
          average_latency_ms: 1250,
          sessions_history_7d: [
            { date: "Mon", sessions: 12 },
            { date: "Tue", sessions: 19 },
            { date: "Wed", sessions: 15 },
            { date: "Thu", sessions: 28 },
            { date: "Fri", sessions: 22 },
            { date: "Sat", sessions: 32 },
            { date: "Sun", sessions: 20 }
          ],
          recent_simulations: [
            { id: 1, prompt: "What is Java Microservices?", model: "distilgpt2", created_at: "Just now" },
            { id: 2, prompt: "Explain machine learning", model: "gpt2", created_at: "10 mins ago" },
            { id: 3, prompt: "Translate hello to french", model: "distilgpt2", created_at: "1 hour ago" }
          ]
        });
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <span className="text-sm font-mono text-slate-500 animate-pulse">Loading Analytics Dashboard...</span>
        </main>
      </div>
    );
  }

  const maxSessions = Math.max(...data.sessions_history_7d.map((d: any) => d.sessions), 1);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex items-center gap-2 text-violet-400">
          <BarChart2 className="h-5 w-5" />
          <h1 className="text-xl font-bold text-white">Laboratory Analytics</h1>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-5 bg-black/40 border border-white/5 flex flex-col gap-1.5 relative overflow-hidden">
            <Users className="absolute right-3 top-3 h-5 w-5 text-violet-500/20" />
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Users</span>
            <span className="text-2xl font-extrabold text-white">{data.total_users}</span>
          </div>

          <div className="glass-panel p-5 bg-black/40 border border-white/5 flex flex-col gap-1.5 relative overflow-hidden">
            <Activity className="absolute right-3 top-3 h-5 w-5 text-violet-500/20" />
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Simulations</span>
            <span className="text-2xl font-extrabold text-white">{data.total_sessions}</span>
          </div>

          <div className="glass-panel p-5 bg-black/40 border border-white/5 flex flex-col gap-1.5 relative overflow-hidden">
            <Shield className="absolute right-3 top-3 h-5 w-5 text-violet-500/20" />
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Simulated Tokens</span>
            <span className="text-2xl font-extrabold text-white">{data.total_tokens_simulated}</span>
          </div>

          <div className="glass-panel p-5 bg-black/40 border border-white/5 flex flex-col gap-1.5 relative overflow-hidden">
            <Zap className="absolute right-3 top-3 h-5 w-5 text-violet-500/20" />
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Average Latency</span>
            <span className="text-2xl font-extrabold text-white">{data.average_latency_ms}ms</span>
          </div>
        </div>

        {/* Chart + History Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Daily Simulations Chart (8 cols) */}
          <div className="md:col-span-8 glass-panel p-5 bg-black/40 border border-white/5 flex flex-col gap-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Simulations Activity (Last 7 Days)</span>
            
            {/* Custom SVG/Bar Chart */}
            <div className="h-44 flex items-end justify-between gap-4 pt-4 border-b border-white/5">
              {data.sessions_history_7d.map((day: any, idx: number) => {
                const heightPercentage = (day.sessions / maxSessions) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-[10px] font-mono text-violet-400 font-bold">{day.sessions}</span>
                    <div className="w-full bg-white/5 rounded-t-md overflow-hidden h-28 flex items-end">
                      <div 
                        className="w-full bg-gradient-to-t from-violet-600 to-indigo-600 rounded-t-md transition-all duration-500" 
                        style={{ height: `${heightPercentage}%` }} 
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono mt-1">{day.date}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Simulation prompts (4 cols) */}
          <div className="md:col-span-4 glass-panel p-5 bg-black/40 border border-white/5 flex flex-col gap-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Simulations</span>
            <div className="flex flex-col gap-3 max-h-[160px] overflow-y-auto">
              {data.recent_simulations.map((s: any, idx: number) => (
                <div key={idx} className="border-b border-white/5 pb-2 text-xs flex flex-col gap-1">
                  <span className="text-white font-semibold truncate">"{s.prompt}"</span>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>{s.model}</span>
                    <span>{s.created_at}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
