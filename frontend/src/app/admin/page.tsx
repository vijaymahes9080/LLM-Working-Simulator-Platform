'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Users, RefreshCw, AlertTriangle, Key } from 'lucide-react';

interface UserItem {
  id: number;
  email: string;
  role: string;
  created_at: string;
}

export default function AdminPage() {
  const { token, user } = useAuth();
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Attempt Admin API call
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch('http://localhost:8000/analytics/admin/users', { headers })
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorised or database error');
        return res.json();
      })
      .then((data) => {
        setUsersList(data);
        setLoading(false);
      })
      .catch(() => {
        // Fallback simulated list for testing admin screens
        const mockUsers: UserItem[] = [
          { id: 1, email: "admin@llminside.local", role: "admin", created_at: new Date().toISOString() },
          { id: 2, email: "student_a@university.edu", role: "user", created_at: new Date().toISOString() },
          { id: 3, email: "developer_beta@ai.io", role: "user", created_at: new Date().toISOString() }
        ];
        setUsersList(mockUsers);
        setLoading(false);
      });
  }, [token]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex items-center gap-2 text-violet-400">
          <Shield className="h-5 w-5" />
          <h1 className="text-xl font-bold text-white">Laboratory Admin Console</h1>
        </div>

        {user?.role !== 'admin' && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-xs flex gap-2 items-center">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>You are viewing the console in <strong>Demo/Offline Mode</strong>. Real user management requires logging in as an administrator.</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          
          {/* Users List Table */}
          <div className="glass-panel p-5 bg-black/40 border border-white/5 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Users className="h-4 w-4 text-violet-400" />
                Registered Laboratory Accounts
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Count: {usersList.length}</span>
            </div>

            {loading ? (
              <span className="text-xs text-slate-500 italic text-center py-6">Loading account records...</span>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-2.5 px-3">ID</th>
                      <th className="py-2.5 px-3">Email Address</th>
                      <th className="py-2.5 px-3">System Role</th>
                      <th className="py-2.5 px-3">Created Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-slate-300">
                    {usersList.map((usr) => (
                      <tr key={usr.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-2.5 px-3">{usr.id}</td>
                        <td className="py-2.5 px-3 text-white">{usr.email}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            usr.role === 'admin' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                          }`}>
                            {usr.role}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">{usr.created_at.slice(0, 19).replace('T', ' ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}
