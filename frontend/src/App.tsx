import './App.css';

import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from './context/AuthContext.tsx';
import { Welcome } from "./pages/Welcome.tsx";
import React, { Suspense } from 'react';

const Login = React.lazy(() => import("./pages/Login.tsx").then((m) => ({ default: m.Login })));
const Register = React.lazy(() => import("./pages/Register.tsx").then((m) => ({ default: m.Register })));
const PendingApproval = React.lazy(() => import("./pages/PendingApproval.tsx").then((m) => ({ default: m.PendingApproval })));
const Dashboard = React.lazy(() => import("./pages/Dashboard.tsx").then((m) => ({ default: m.Dashboard })));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashBoard.tsx").then((m) => ({ default: m.AdminDashboard })));
const Profile = React.lazy(() => import("./pages/Profile.tsx").then((m) => ({ default: m.Profile })));
const Placeholder = React.lazy(() => import("./pages/Placeholder.tsx"));

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
      <Suspense fallback={<div />}> 
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
      </Suspense>
    </div>
  );
}