import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext.jsx';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Teams from './pages/Teams';
import CreateTeam from './pages/CreateTeam';
import Register from './pages/Register';
import AdminUsers from './pages/AdminUsers';

function App() {
    const Protected = ({ children }) => {
        const { token, loading } = useContext(AuthContext);
        if (loading) return null;
        return token ? children : <Navigate to="/login" replace />;
    };
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected Routes (Wrapped in Layout) */}
                    <Route element={<Layout />}>
                        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
                        <Route path="/teams" element={<Protected><Teams /></Protected>} />
                        <Route path="/teams/create" element={<Protected><CreateTeam /></Protected>} />
                        <Route path="/admin/users" element={<Protected><AdminUsers /></Protected>} />
                        {/* Add more protected pages here later */}
                    </Route>

                    {/* Redirect root to dashboard */}
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;