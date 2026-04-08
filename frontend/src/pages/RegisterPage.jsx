import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    password2: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setErrors((prev) => ({
      ...prev,
      [e.target.name]: '',
      form: '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!formData.username) newErrors.username = 'Username required';
    if (!formData.email) newErrors.email = 'Email required';
    if (!formData.first_name) newErrors.first_name = 'First name required';
    if (!formData.last_name) newErrors.last_name = 'Last name required';
    if (!formData.password) newErrors.password = 'Password required';

    if (formData.password !== formData.password2) {
      newErrors.password2 = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

      await register({
        ...formData,
        role: 'employee', // ✅ IMPORTANT
      });

      navigate('/dashboard');

    } catch (err) {
      console.error(err);

      setErrors({
        form:
          err?.response?.data?.error ||
          err?.response?.data?.detail ||
          'Registration failed',
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8">

        <h1 className="text-3xl font-bold text-center mb-6">Create Account</h1>

        {errors.form && (
          <p className="text-red-500 text-center mb-4">{errors.form}</p>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 md:grid-cols-2">

          <input name="username" placeholder="Username" onChange={handleChange} className="input-field" />
          <input name="email" placeholder="Email" onChange={handleChange} className="input-field" />

          <input name="first_name" placeholder="First Name" onChange={handleChange} className="input-field" />
          <input name="last_name" placeholder="Last Name" onChange={handleChange} className="input-field" />

          <input name="phone" placeholder="Phone" onChange={handleChange} className="input-field md:col-span-2" />

          <input type="password" name="password" placeholder="Password" onChange={handleChange} className="input-field" />
          <input type="password" name="password2" placeholder="Confirm Password" onChange={handleChange} className="input-field" />

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg"
            >
              {loading ? 'Creating...' : 'Register'}
            </button>
          </div>
        </form>

        <p className="mt-4 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-bold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}