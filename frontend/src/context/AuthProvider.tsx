import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthContext } from './AuthContext';
import { authService } from '../services/auth';
import type { LoginResponse } from '../services/auth';
import { normalizeApiError } from '../services/api.js';

export type AuthContextValue = {
  token: string | null;
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string; user?: User; code?: 'ACCOUNT_PENDING' | 'ACCOUNT_DISABLED' | 'ACCOUNT_NOT_ACTIVE' | 'INVALID_CREDENTIALS' | 'UNKNOWN' }>;
  logout: () => void;
  clearError: () => void;
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

function getNormalized(err: unknown): { status: number; code?: string; message: string } {
  // If the Axios interceptor attached normalized error, use it.
  if (err && typeof err === 'object' && 'normalized' in err) {
    const n = (err as { normalized?: unknown }).normalized;
    if (n && typeof n === 'object') {
      const maybe = n as { status?: unknown; code?: unknown; message?: unknown };
      return {
        status: typeof maybe.status === 'number' ? maybe.status : 0,
        code: typeof maybe.code === 'string' ? maybe.code : undefined,
        message: typeof maybe.message === 'string' ? maybe.message : 'Operation failed',
      };
    }
  }

  // Fallback: normalize directly.
  const n = normalizeApiError(err);
  return { status: n.status, code: n.code, message: n.message };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setError(null);
    localStorage.removeItem('token');
  }, []);

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
        setError(getNormalized(e).message || 'Failed to load user');
        logout();
      } finally {
        setLoading(false);
      }
    };
    void loadUser();
  }, [token, logout]);

  const login = useCallback(async (username: string, password: string) => {
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
    } catch (e) {
      const { message: msg, status, code } = getNormalized(e);
      // For "account not active" cases we redirect to a dedicated page.
      // Avoid persisting an auth error that would show up when navigating back to Login.
      if (status === 403) {
        if (code === 'ACCOUNT_PENDING') return { success: false, message: msg, code: 'ACCOUNT_PENDING' as const };
        if (code === 'ACCOUNT_DISABLED') return { success: false, message: msg, code: 'ACCOUNT_DISABLED' as const };
        if (code === 'ACCOUNT_NOT_ACTIVE') return { success: false, message: msg, code: 'ACCOUNT_NOT_ACTIVE' as const };

        // Some backends return 403 for bad credentials. If we don't recognize the code,
        // treat it as invalid credentials so the user gets feedback.
        const friendly = 'Invalid username or password.';
        setError(friendly);
        return { success: false, message: friendly, code: 'INVALID_CREDENTIALS' as const };
      }

      if (status === 401) {
        const friendly = 'Invalid username or password.';
        setError(friendly);
        return { success: false, message: friendly, code: 'INVALID_CREDENTIALS' as const };
      }

      setError(msg);
      return { success: false, message: msg, code: 'UNKNOWN' as const };
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    token,
    user,
    login,
    logout,
    clearError,
    loading,
    error,
    // Treat the session as authenticated only after we've validated the token
    // by successfully loading the current user from the backend.
    isAuthenticated: !!user,
  }), [token, user, login, logout, clearError, loading, error]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
