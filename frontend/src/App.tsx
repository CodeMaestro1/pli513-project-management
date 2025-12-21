import './App.css';

import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Login } from "./pages/Login.tsx";
import { Dashboard } from "./pages/Dashboard.tsx";
import { Profile } from "./pages/Profile.tsx";
import Placeholder from "./pages/Placeholder.tsx";
import { Register } from "./pages/Register.tsx";
import { PendingApproval } from './pages/PendingApproval.tsx';  
import { useAuth } from './context/AuthContext.tsx';
import React from 'react';
import { Welcome } from "./pages/Welcome.tsx";
import { AdminDashboard } from "./pages/AdminDashBoard.tsx";

function PrivateRoute({ children }: { children: React.JSX.Element }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }: { children: React.JSX.Element }) {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return user?.role === 'ADMIN' ? children : <Navigate to="/dashboard" replace />;
}

function ProtectedPendingApproval({ children }: { children: React.JSX.Element }) {
  const location = useLocation();
  const hasState = location.state?.userEmail;

  return hasState ? children : <Navigate to="/" replace />;
}

export default function App() {
  const navigate = useNavigate();
  const { logout, user, loading } = useAuth();

  const handleSignIn = () => navigate("/login");
  const handleSignUp = () => navigate("/register");
  const handleBackToHome = () => navigate("/");
  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Routes>
        <Route path="/" element={<Welcome onSignIn={handleSignIn} onSignUp={handleSignUp} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/pending-approval" 
          element={
            <ProtectedPendingApproval>
              <PendingApproval onBackToHome={handleBackToHome} />
            </ProtectedPendingApproval>
          } 
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              {loading ? <div /> : user?.role === 'ADMIN' ? (
                <Navigate to="/admin" replace />
              ) : (
                <Dashboard
                  onProfileClick={() => navigate("/profile")}
                  onLogout={handleLogout}
                />
              )}
            </PrivateRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard
                onProfileClick={() => navigate("/profile")}
                onLogout={handleLogout}
              />
            </AdminRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route path="/Placeholder" element={<PrivateRoute><Placeholder /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}