import React, { useEffect, useState, useContext } from 'react';
import { adminService } from '../services/admin';
import { AuthContext } from '../context/AuthContext.jsx';

const AdminUsers = () => {
  const { user } = useContext(AuthContext);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState(null);

  const isAdmin = () => {
    const roles = user?.roles || user?.authorities || [];
    return Array.isArray(roles)
      ? roles.some(r => (r.role || r.authority || r) === 'ADMIN' || (r.role || r.authority || r) === 'ROLE_ADMIN')
      : false;
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const list = await adminService.listPendingUsers();
        setPending(list);
      } catch (e) {
        setError(e?.response?.data?.message || e?.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    if (isAdmin()) {
      void load();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const approve = async (id) => {
    setActionId(id);
    try {
      await adminService.approveUser(id);
      setPending(prev => prev.filter(u => u.id !== id));
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message;
      setError(msg || 'Approve failed');
    } finally {
      setActionId(null);
    }
  };

  const reject = async (id) => {
    setActionId(id);
    try {
      await adminService.deleteUser(id);
      setPending(prev => prev.filter(u => u.id !== id));
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message;
      setError(msg || 'Reject (delete) failed');
    } finally {
      setActionId(null);
    }
  };

  if (!isAdmin()) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">Admin Approvals</h2>
        <p className="text-gray-600 mt-2">You must be an admin to view this page.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold">Pending User Approvals</h2>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
      {loading ? (
        <div className="text-gray-600">Loading...</div>
      ) : (
        <div className="mt-4">
          {pending.length === 0 ? (
            <div className="text-gray-600">No pending users.</div>
          ) : (
            <ul className="divide-y">
              {pending.map(u => (
                <li key={u.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{u.username}</div>
                    <div className="text-sm text-gray-600">{u.email} · {u.firstName} {u.lastName}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-50"
                      onClick={() => approve(u.id)}
                      disabled={actionId === u.id}
                    >Approve</button>
                    <button
                      className="px-3 py-1 bg-red-600 text-white rounded disabled:opacity-50"
                      onClick={() => reject(u.id)}
                      disabled={actionId === u.id}
                    >Reject</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
