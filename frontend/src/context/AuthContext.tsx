import { createContext, useContext } from 'react';
import type { AuthContextValue } from './AuthProvider'; // Import the type from the provider file

export const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};