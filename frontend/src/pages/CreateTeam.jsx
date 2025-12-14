import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { teamService } from '../services/teams';
import { AuthContext } from '../context/AuthContext.jsx';

const CreateTeam = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  // Team leader is optional per backend; we'll omit by default
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    if (user?.role !== 'ADMIN') {
      setError('You do not have permission to create teams.');
      setSubmitting(false);
      return;
    }
    try {
      const payload = { name, description };
      await teamService.create(payload);
      navigate('/teams');
    } catch (err) {
      const serverMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message;
      setError(serverMsg ? `Failed to create team: ${serverMsg}` : 'Failed to create team');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Create Team</h2>
      {user?.role !== 'ADMIN' && (
        <div className="bg-yellow-100 text-yellow-800 p-3 rounded mb-4 text-sm">
          This action requires ADMIN role.
        </div>
      )}
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
      <form onSubmit={onSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">Team Name</label>
          <input className="w-full border rounded px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">Description</label>
          <textarea className="w-full border rounded px-3 py-2" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        {/* Leader optional; omitted by default */}
        <div className="flex gap-3">
          <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
            {submitting ? 'Creating...' : 'Create Team'}
          </button>
          <button type="button" onClick={() => navigate('/teams')} className="px-4 py-2 border rounded">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default CreateTeam;
