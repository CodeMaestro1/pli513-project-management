import React, { createContext, useState, useEffect, useMemo, useContext } from 'react';
import { authService } from '../services/auth';

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load profile when token changes
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
                const me = await authService.me(token);
                setUser(me);
            } catch (e) {
                setError(e?.message || 'Failed to load user');
                logout();
            } finally {
                setLoading(false);
            }
        };
        void loadUser();
    }, [token]);

    const login = async (username, password) => {
        setLoading(true);
        setError(null);
        try {
            const { token: jwt, user: profile } = await authService.login(username, password);
            setToken(jwt);
            if (profile) setUser(profile);
            return { success: true };
        } catch (error) {
            setError(error?.message || 'Login failed');
            return {
                success: false,
                message: error?.message || 'Login failed',
            };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
    };

    const value = useMemo(() => ({
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