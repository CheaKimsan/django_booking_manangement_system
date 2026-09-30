import {
  createContext, useContext, useMemo, useState, useCallback, useEffect, ReactNode,
} from 'react';
import { AuthContextState, AuthUser, RegisterPayload } from './core/types';
import api from "../../../service/api";

const AuthContext = createContext<AuthContextState | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Instant restore on page refresh (maybe slightly stale, refreshed below)
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const logout = useCallback(() => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  // GET /auth/me and save the result
  const userProfile = useCallback(async () => {
    const { data } = await api.get<AuthUser>('/auth/profile');
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const { data } = await api.post('/auth/login', { username, password });
    localStorage.setItem('access', data.access);
    localStorage.setItem('refresh', data.refresh);
    await userProfile(); // token is now saved, so the interceptor sends it
  }, [userProfile]);

  const register = useCallback(async (payload: RegisterPayload) => {
    await api.post('/auth/register', payload);
  }, []);

  // On app start, if a token exists, fetch the latest profile
  useEffect(() => {
    if (localStorage.getItem('access')) {
      userProfile().catch(() => logout()); // token expired/invalid -> log out
    }
  }, [userProfile, logout]);

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, login, register, logout, userProfile }),
    [user, login, register, logout, userProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};