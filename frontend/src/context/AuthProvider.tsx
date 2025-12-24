import React, { useState, useEffect, useMemo } from 'react';
import { AuthContext } from './AuthContext';
import { authService } from '../services/auth';
import type { LoginResponse } from '../services/auth';

export type AuthContextValue = {
  token: string | null;
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string; user?: User; code?: 'ACCOUNT_NOT_ACTIVE' | 'INVALID_CREDENTIALS' | 'UNKNOWN' }>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
};

export type User = {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  status?: 'ACTIVE' | 'PENDING' | 'DISABLED';
  role?: 'ADMIN' | 'LEADER' | 'MEMBER';
  createdAt: string;
}

function normalizeUser(maybeUser: unknown): User | undefined {
  if (!maybeUser || typeof maybeUser !== 'object') return undefined;
  if (!('id' in maybeUser) || !('username' in maybeUser)) return undefined;
  const u = maybeUser as { status?: unknown };
  const status = typeof u.status === 'string' ? u.status.toUpperCase() : u.status;
  return { ...(maybeUser as object), status } as User;
}

function getErrorMessage(err: unknown): string {
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object') {
    const maybe = err as { message?: string; response?: { data?: { message?: string } } };
    return maybe.response?.data?.message ?? maybe.message ?? 'Operation failed';
  }
  return 'Operation failed';
}

function getErrorStatus(err: unknown): number | undefined {
  if (!err || typeof err !== 'object') return undefined;
  const maybe = err as { response?: { status?: number } };
  return maybe.response?.status;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      setError(null);
      if (!token) {
        setUser(null);
        localStorage.removeItem('token');
        setLoading(false);
        return;
      }
      localStorage.setItem('token', token);
      try {
        const me = await authService.me();
        if (me && typeof me === 'object' && 'id' in me && 'username' in me) {
          setUser(me as User); // Ensure `me` matches the `User` type
        } else {
          setUser(null); // Fallback to null if `me` is invalid
        }
      } catch (e) {
        setError(getErrorMessage(e) || 'Failed to load user');
        logout();
      } finally {
        setLoading(false);
      }
    };
    void loadUser();
  }, [token]);

  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res: LoginResponse = await authService.login(username, password);
      const { token: jwt, user: profile } = res;
      localStorage.setItem('token', jwt);
      setToken(jwt);

      const normalizedProfile = normalizeUser(profile);
      if (normalizedProfile) {
        setUser(normalizedProfile);
        return { success: true, user: normalizedProfile };
      }

      const me = await authService.me();
      const normalizedMe = normalizeUser(me);
      if (normalizedMe) setUser(normalizedMe);
      return { success: true, user: normalizedMe };
    } catch (error) {
      const msg = getErrorMessage(error) || 'Login failed';
      setError(msg);
      const status = getErrorStatus(error);
      if (status === 403) return { success: false, message: msg, code: 'ACCOUNT_NOT_ACTIVE' as const };
      if (status === 401) return { success: false, message: msg, code: 'INVALID_CREDENTIALS' as const };
      return { success: false, message: msg, code: 'UNKNOWN' as const };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  const value = useMemo<AuthContextValue>(() => ({
    token,
    user,
    login,
    logout,
    loading,
    error,
    isAuthenticated: !!token,
  }), [token, user, loading, error]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
