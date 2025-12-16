import './App.css'

import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Login } from "./pages/Login.tsx";
import Placeholder from "./pages/Placeholder.tsx";
import { Register } from "./pages/Register.tsx";
import { useAuth } from './context/AuthContext.tsx';
import React from 'react';
import { Welcome } from "./pages/Welcome.tsx";

function PrivateRoute({ children }: { children: React.JSX.Element }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const navigate = useNavigate();
  const handleSignIn = () => navigate("/login");
  const handleSignUp = () => navigate("/register");

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Routes>
        <Route path="/" element={<Welcome onSignIn={handleSignIn} onSignUp={handleSignUp} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/Placeholder" element={<PrivateRoute><Placeholder /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}