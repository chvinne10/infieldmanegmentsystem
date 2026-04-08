import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setErrors({ form: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      setErrors({ form: 'All fields required' });
      return;
    }

    try {
      setLoading(true);

      await login(formData.username, formData.password);

      navigate('/dashboard');

    } catch (err) {
      console.error(err);

      setErrors({
        form:
          err?.response?.data?.detail ||
          'Invalid credentials',
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">

      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">

        <h1 className="text-3xl font-bold text-center mb-6">Login</h1>

        {errors.form && (
          <p className="text-red-500 text-center mb-4">{errors.form}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          <input
            name="username"
            placeholder="Username"
            onChange={handleChange}
            className="input-field"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="input-field"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-center">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 font-bold">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}