import React, {useState, useEffect, useMemo} from 'react';
import { AuthContext } from './AuthContext';
import { authService } from '../services/auth';
import type { LoginResponse } from '../services/auth';

export type AuthContextValue = {
  token: string | null;
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
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
    role?: 'admin' | 'leader' | 'member';
}

function getErrorMessage(err: unknown): string {
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object') {
    const maybe = err as { message?: string; response?: { data?: { message?: string } } };
    return maybe.response?.data?.message ?? maybe.message ?? 'Operation failed';
  }
  return 'Operation failed';
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
    setToken(jwt);
    if (profile) setUser(profile);
    return { success: true };
  } catch (error) {
    const msg = getErrorMessage(error) || 'Login failed';
    setError(msg);
    return { success: false, message: msg };
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
