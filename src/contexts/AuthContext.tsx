"use client";
import { createContext, useContext, useState } from 'react';
import { login as apiLogin } from '../services/api';

interface AuthContextType {
  login: (email: string, password: string) => Promise<boolean>;
  error: string | null;
  // outros campos...
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await apiLogin(email, password);
      setToken(res.token);
      setError('');
      localStorage.setItem('token', res.token);
      return true;
    } catch (err) {
      setError('Login inválido');
      return false;
    }
  };

  const logout = () => {
    setToken('');
    setError('');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ login, error, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}