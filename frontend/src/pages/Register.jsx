import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    password: '',
    email: '',
    firstName: '',
    lastName: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await authService.register(form);
      setSuccess('Account created. You can now sign in.');
      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message;
      setError(msg || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg w-96">
        <h3 className="text-2xl font-bold text-center text-blue-600">Create an account</h3>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{success}</div>}
        <form onSubmit={onSubmit}>
          <div className="mt-4">
            <label className="block" htmlFor="username">Username</label>
            <input name="username" value={form.username} onChange={onChange} className="w-full px-4 py-2 mt-2 border rounded-md" required />
          </div>
          <div className="mt-4">
            <label className="block" htmlFor="password">Password</label>
            <input type="password" name="password" value={form.password} onChange={onChange} className="w-full px-4 py-2 mt-2 border rounded-md" required />
          </div>
          <div className="mt-4">
            <label className="block" htmlFor="email">Email</label>
            <input type="email" name="email" value={form.email} onChange={onChange} className="w-full px-4 py-2 mt-2 border rounded-md" required />
          </div>
          <div className="mt-4">
            <label className="block" htmlFor="firstName">First Name</label>
            <input name="firstName" value={form.firstName} onChange={onChange} className="w-full px-4 py-2 mt-2 border rounded-md" required />
          </div>
          <div className="mt-4">
            <label className="block" htmlFor="lastName">Last Name</label>
            <input name="lastName" value={form.lastName} onChange={onChange} className="w-full px-4 py-2 mt-2 border rounded-md" required />
          </div>
          <div className="flex items-baseline justify-between mt-4">
            <button className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-900 w-full" disabled={submitting}>
              {submitting ? 'Creating...' : 'Sign Up'}
            </button>
          </div>
        </form>
        <div className="text-sm text-gray-600 mt-3 text-center">
          Already have an account? <a href="/login" className="text-blue-600">Sign in</a>
        </div>
      </div>
    </div>
  );
};

export default Register;
