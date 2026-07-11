'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Cpu, LogOut, GraduationCap, BarChart2, Layers, GitCompare, Play, User as UserIcon, Compass } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();

  const navLinks = [
    { href: '/pipeline', label: 'Simulator', icon: Play },
    { href: '/vector-math', label: 'Vector Math', icon: Compass },
    { href: '/experiment', label: 'Experiments', icon: Layers },
    { href: '/compare', label: 'Compare', icon: GitCompare },
    { href: '/education', label: 'Learn', icon: GraduationCap },
    { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  ];


  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#06060c]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 glow-purple">
            <Cpu className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-wider text-white">
            LLM <span className="text-violet-400">INSIDE</span>
          </span>
        </Link>

        {/* Navigation items */}
        {isAuthenticated && (
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? 'text-violet-400 bg-white/5 border border-white/5'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Auth details & Profile */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                <UserIcon className="h-3.5 w-3.5 text-violet-400" />
                <span className="text-xs font-semibold text-slate-300">
                  {user?.role === 'guest' ? 'Guest Mode' : user?.email}
                </span>
              </div>
              {user?.role === 'admin' && (
                <Link
                  href="/admin"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                    isActive('/admin')
                      ? 'text-violet-400 border-violet-500/30 bg-violet-500/5'
                      : 'text-slate-400 border-white/5 hover:text-white'
                  }`}
                >
                  Admin
                </Link>
              )}
              <button
                onClick={logout}
                className="flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-colors border border-white/5"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <Link
              href="/"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
