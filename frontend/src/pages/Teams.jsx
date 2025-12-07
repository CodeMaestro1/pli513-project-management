import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Teams = () => {
    const { user } = useContext(AuthContext);

    // Data State
    const [teams, setTeams] = useState([]);
    const [users, setUsers] = useState([]); // For the "Leader" dropdown

    // UI State
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        teamLeaderId: ''
    });

    // 1. Load Teams on Mount
    useEffect(() => {
        const loadTeams = async () => {
            try {
                // Admins see all teams? For now, let's keep it consistent with "My Teams"
                // or you can change to '/api/v1/teams' if you implemented the getAllTeams endpoint.
                const endpoint = '/api/v1/teams/my-teams';
                const res = await axios.get(endpoint);
                setTeams(res.data);
            } catch (err) {
                console.error("Failed to fetch teams", err);
            } finally {
                setLoading(false);
            }
        };

        void loadTeams();
    }, []);

    // 2. Fetch Users when Admin opens the modal
    const handleOpenModal = async () => {
        setShowModal(true);
        if (user.role === 'ADMIN' && users.length === 0) {
            try {
                const res = await axios.get('/api/v1/admin/users');
                setUsers(res.data);
            } catch (err) {
                console.error("Failed to load users for dropdown", err);
                setError("Could not load users list.");
            }
        }
    };

    // 3. Handle Create Team Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setCreating(true);
        setError('');

        try {
            await axios.post('/api/v1/teams', {
                name: formData.name,
                description: formData.description,
                teamLeaderId: Number(formData.teamLeaderId) // Ensure it's a Long/Number
            });

            // Refresh list and close
            setShowModal(false);
            setFormData({ name: '', description: '', teamLeaderId: '' });

            // Reload teams to show the new one
            const res = await axios.get('/api/v1/teams/my-teams');
            setTeams(res.data);

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to create team");
        } finally {
            setCreating(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading teams...</div>;

    return (
        <div className="relative">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Teams</h1>
                {user?.role === 'ADMIN' && (
                    <button
                        onClick={handleOpenModal}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                    >
                        + Create New Team
                    </button>
                )}
            </div>

            {/* Teams Grid */}
            {teams.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-lg shadow">
                    <p className="text-gray-500">You are not a member of any team yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map((team) => (
                        <div key={team.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border-t-4 border-blue-500 flex flex-col justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{team.name}</h3>
                                <p className="text-gray-600 text-sm mb-4">{team.description}</p>
                            </div>
                            <div className="border-t pt-4 flex justify-between items-center mt-4">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  Members: {team.memberIds?.length || 0}
                </span>
                                {/* Placeholder for View Details */}
                                <button className="text-blue-600 text-sm font-semibold hover:underline">
                                    View Board →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* CREATE TEAM MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">Create New Team</h2>

                        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2 text-gray-700">Team Name</label>
                                <input
                                    type="text"
                                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2 text-gray-700">Description</label>
                                <textarea
                                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-bold mb-2 text-gray-700">Assign Leader</label>
                                <select
                                    className="w-full border rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.teamLeaderId}
                                    onChange={e => setFormData({...formData, teamLeaderId: e.target.value})}
                                    required
                                >
                                    <option value="">-- Select a User --</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>
                                            {u.username} ({u.role})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold disabled:opacity-50"
                                >
                                    {creating ? 'Creating...' : 'Create Team'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Teams;