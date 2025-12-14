import './App.css'

import { Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/Login.tsx";
import Placeholder from "./pages/Placeholder.tsx";
import { useAuth } from './context/AuthContext.jsx';
import React from 'react';

function PrivateRoute({ children }: { children: React.JSX.Element }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Routes>
        <Route path="/" element={<Navigate to="/Placeholder" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Placeholder" element={<PrivateRoute><Placeholder /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}