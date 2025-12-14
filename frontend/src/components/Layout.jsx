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
            <nav style={{ display: 'flex', gap: '12px', padding: '8px' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <span className="font-bold text-xl tracking-tight">PMS</span>
                            <div className="ml-10 flex items-baseline space-x-4">
                                <Link to="/dashboard" className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-500 ${isActive('/dashboard')}`}>Dashboard</Link>
                                <Link to="/teams" className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-500 ${isActive('/teams')}`}>Teams</Link>
                                <Link to="/tasks" className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-500 ${isActive('/tasks')}`}>My Tasks</Link>
                                {(() => {
                                    const arr = user ? (user.authorities || user.roles || []) : [];
                                    const normalize = (v) => String(v).toUpperCase();
                                    const matchesAdmin = (v) => {
                                        const n = normalize(v);
                                        return n === 'ADMIN' || n === 'ROLE_ADMIN';
                                    };
                                    const hasAdminInArray = Array.isArray(arr)
                                        ? arr.some(r => matchesAdmin(r.role || r.authority || r))
                                        : false;
                                    const hasAdminInRole = user?.role ? matchesAdmin(user.role) : false;
                                    const isAdmin = hasAdminInArray || hasAdminInRole;
                                    return isAdmin ? (
                                        <Link to="/admin/users" className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-500 ${isActive('/admin/users')}`}>Admin Approvals</Link>
                                    ) : null;
                                })()}
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-right">
                                <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
                                <p className="text-xs text-blue-200">{user?.role || (user?.roles ? user.roles.map(r => r.role || r.authority || r).join(', ') : '')}</p>
                            </div>
                            {!user ? (
                                <Link to="/login" className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-sm font-bold">Login</Link>
                            ) : (
                                <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm font-bold">Logout</button>
                            )}
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