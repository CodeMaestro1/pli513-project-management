import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { teamService } from '../services/teams';
import { taskService } from '../services/tasks';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [stats, setStats] = useState({
        teamsCount: 0,
        todo: 0,
        inProgress: 0,
        done: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const teams = await teamService.listMyTeams();
                const tasks = await taskService.listMyTasks();

                // 3. Calculate Stats
                setStats({
                    teamsCount: Array.isArray(teams) ? teams.length : 0,
                    todo: tasks.filter(t => t.status === 'TODO').length,
                    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
                    done: tasks.filter(t => t.status === 'DONE').length
                });
            } catch (error) {
                console.error("Error fetching dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        void fetchDashboardData();
    }, []);

    if (loading) return <div className="text-center mt-20">Loading stats...</div>;

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navbar Placeholder */}
            <nav className="bg-white shadow mb-8 p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-blue-600">PMS Dashboard</h1>
                <div className="flex items-center gap-4">
                    <span className="text-gray-700">Welcome, <b>{user?.firstName} {user?.lastName}</b> ({user?.role})</span>
                    <button onClick={logout} className="text-red-500 hover:text-red-700 font-semibold">Logout</button>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Overview</h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Stat Cards */}
                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                        <h3 className="text-gray-500 text-sm uppercase font-semibold">My Teams</h3>
                        <p className="text-3xl font-bold text-gray-800 mt-2">{stats.teamsCount}</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
                        <h3 className="text-gray-500 text-sm uppercase font-semibold">Tasks To Do</h3>
                        <p className="text-3xl font-bold text-gray-800 mt-2">{stats.todo}</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-500">
                        <h3 className="text-gray-500 text-sm uppercase font-semibold">In Progress</h3>
                        <p className="text-3xl font-bold text-gray-800 mt-2">{stats.inProgress}</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                        <h3 className="text-gray-500 text-sm uppercase font-semibold">Completed</h3>
                        <p className="text-3xl font-bold text-gray-800 mt-2">{stats.done}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;