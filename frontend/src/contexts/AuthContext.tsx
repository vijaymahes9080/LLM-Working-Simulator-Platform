'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  email: string;
  role: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  login: (token: string, email: string, role: string) => void;
  logout: () => void;
  setGuestMode: (token: string, email: string) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load auth from localStorage
    const savedToken = localStorage.getItem('llm_inside_token');
    const savedUser = localStorage.getItem('llm_inside_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (newToken: string, email: string, role: string) => {
    localStorage.setItem('llm_inside_token', newToken);
    const userData = { email, role };
    localStorage.setItem('llm_inside_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('llm_inside_token');
    localStorage.removeItem('llm_inside_user');
    setToken(null);
    setUser(null);
  };

  const setGuestMode = (guestToken: string, guestEmail: string) => {
    login(guestToken, guestEmail, 'guest');
  };

  const isAuthenticated = !!token;
  const isGuest = user?.role === 'guest';

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, isGuest, login, logout, setGuestMode, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
