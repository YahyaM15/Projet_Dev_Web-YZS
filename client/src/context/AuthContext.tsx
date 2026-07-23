import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import { authApi } from '../services/api';
import type { User, LoginInput, RegisterInput } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await authApi.me();
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const login = useCallback(async (data: LoginInput) => {
    await authApi.login(data);
    const res = await authApi.me();
    setUser(res.data);
  }, []);

  const register = useCallback(async (data: RegisterInput) => {
    await authApi.register(data);
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
