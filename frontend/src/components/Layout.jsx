import React, { useContext } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Layout = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path) => location.pathname === path ? "bg-blue-700" : "";

    const handleLogout = () => {
        logout();
        navigate('/login');
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navigation Bar */}
            <nav className="bg-blue-600 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <span className="font-bold text-xl tracking-tight">PMS</span>
                            <div className="ml-10 flex items-baseline space-x-4">
                                <Link to="/dashboard" className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-500 ${isActive('/dashboard')}`}>Dashboard</Link>
                                <Link to="/teams" className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-500 ${isActive('/teams')}`}>Teams</Link>
                                <Link to="/tasks" className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-500 ${isActive('/tasks')}`}>My Tasks</Link>
                                {user?.role === 'ADMIN' && (
                                    <Link to="/admin" className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-500 ${isActive('/admin')}`}>Admin</Link>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-right">
                                <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
                                <p className="text-xs text-blue-200">{user?.role}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm font-bold"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Page Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <Outlet /> {/* This is where the child pages (Dashboard, Teams) will render */}
            </main>
        </div>
    );
};

export default Layout;