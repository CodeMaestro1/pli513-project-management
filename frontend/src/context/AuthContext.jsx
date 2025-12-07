import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // 1. Setup Axios & Fetch User Profile
    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                localStorage.setItem('token', token);

                try {
                    // ✅ Fetch User Profile
                    const res = await axios.get('/api/v1/users/me');
                    setUser(res.data);
                } catch (error) {
                    console.error("Failed to load user", error);
                    logout(); // Token is invalid/expired
                }
            } else {
                delete axios.defaults.headers.common['Authorization'];
                localStorage.removeItem('token');
                setUser(null);
            }
            setLoading(false);
        };

        void loadUser();
    }, [token]);

    const login = async (username, password) => {
        try {
            const res = await axios.post('/api/v1/auth/login', { username, password });
            setToken(res.data.token);
            return { success: true };
        } catch (error) {
            console.error("Login failed", error);
            return {
                success: false,
                message: error.response?.data?.message || "Login failed"
            };
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};