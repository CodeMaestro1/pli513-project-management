import './App.css';

import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from './context/AuthContext.tsx';
import { Welcome } from "./pages/Welcome.tsx";
import { Suspense } from 'react';

import { Login } from "./pages/Login.tsx";
import { Register } from "./pages/Register.tsx";

const PendingApproval = (await import('react')).lazy(() => import("./pages/PendingApproval.tsx").then((m) => ({ default: m.PendingApproval })));
const ForgotPassword = (await import('react')).lazy(() => import("./pages/ForgotPassword.tsx").then((m) => ({ default: m.ForgotPassword })));
const Dashboard = (await import('react')).lazy(() => import("./pages/Dashboard.tsx").then((m) => ({ default: m.Dashboard })));
const AdminDashboard = (await import('react')).lazy(() => import("./pages/AdminDashBoard.tsx").then((m) => ({ default: m.AdminDashboard })));
const Profile = (await import('react')).lazy(() => import("./pages/Profile.tsx").then((m) => ({ default: m.Profile })));
const DisabledAccount = (await import('react')).lazy(() => import("./pages/DisabledAccount.tsx").then((m) => ({ default: m.DisabledAccount })));

function PrivateRoute({ children }: { children: React.JSX.Element }) {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const status = typeof user?.status === 'string' ? user.status.toUpperCase() : undefined;
  if (status === 'PENDING' && user?.email) {
    return <Navigate to="/pending-approval" state={{ userEmail: user.email }} replace />;
  }
  if (status === 'DISABLED' && user?.email) {
    return <Navigate to="/disabled-account" state={{ userEmail: user.email }} replace />;
  }

  return children;
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

function DisabledAccountRoute({ onBackToHome }: { onBackToHome: () => void }) {
  const location = useLocation();
  const state = location.state as {
    userEmail?: string;
    title?: string;
    description?: string;
    reasons?: string[];
    supportEmail?: string;
    adminEmail?: string;
  } | undefined;

  const userEmail = state?.userEmail;

  if (!userEmail) return <Navigate to="/" replace />;
  return (
    <DisabledAccount
      userEmail={userEmail}
      onBackToHome={onBackToHome}
      title={state?.title}
      description={state?.description}
      reasons={state?.reasons}
      supportEmail={state?.supportEmail}
      adminEmail={state?.adminEmail}
    />
  );
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
      <Suspense fallback={<div className="w-full text-center text-slate-500 text-sm">Loading…</div>}>
        <Routes>
          <Route path="/" element={<Welcome onSignIn={handleSignIn} onSignUp={handleSignUp} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword onBackToLogin={() => navigate('/login')} />} />
          <Route
            path="/pending-approval"
            element={
              <ProtectedPendingApproval>
                <PendingApproval onBackToHome={handleBackToHome} />
              </ProtectedPendingApproval>
            }
          />
          <Route
            path="/disabled-account"
            element={
              <DisabledAccountRoute onBackToHome={handleBackToHome} />
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}