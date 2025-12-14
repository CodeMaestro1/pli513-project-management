import './App.css'

import { Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/Login.tsx";
import { useAuth } from './context/AuthContext.jsx';

function Home() {
  const { user, logout } = useAuth();
  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6">
      <h2 className="text-2xl mb-2">Welcome</h2>
      <p className="text-slate-600 mb-4">{user ? `Hello, ${user.username || user.email}` : 'You are logged in.'}</p>
      <button className="px-4 py-2 bg-slate-800 text-white rounded" onClick={logout}>Logout</button>
    </div>
  );
}

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}