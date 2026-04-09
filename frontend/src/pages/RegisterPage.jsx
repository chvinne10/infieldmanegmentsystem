import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../services/api'; 

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    password2: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '', form: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.password2) {
      setErrors({ password2: 'Passwords do not match' });
      return;
    }

    try {
      setLoading(true);

      // 1. Explicitly build the payload so we KNOW it's not empty
      const payload = {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        password: formData.password,
        password2: formData.password2,
        role: 'employee'
      };

      // 2. Log it to the console so you can see it working!
      console.log("Sending payload to Django:", payload);

      // 3. Send it to Render
      await apiClient.post("/api/users/register/", payload);

      alert("Registration Successful! Please log in.");
      navigate('/login');

    } catch (err) {
      console.error("Registration failed:", err.response?.data || err);
      
      // Better error handling to show exactly which field Django rejected
      const errorData = err.response?.data;
      let errorMessage = "Registration failed.";
      
      if (errorData) {
        if (errorData.username) errorMessage = `Username: ${errorData.username[0]}`;
        else if (errorData.email) errorMessage = `Email: ${errorData.email[0]}`;
        else if (errorData.password) errorMessage = `Password: ${errorData.password[0]}`;
        else if (errorData.detail) errorMessage = errorData.detail;
      }

      setErrors({ form: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6">Create Account</h1>

        {errors.form && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center font-semibold">
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 md:grid-cols-2">
          
          <div>
            <input name="username" value={formData.username} placeholder="Username" required onChange={handleChange} className="w-full p-3 border rounded-lg" />
            {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
          </div>

          <div>
            <input name="email" value={formData.email} type="email" placeholder="Email" required onChange={handleChange} className="w-full p-3 border rounded-lg" />
          </div>

          <div>
            <input name="first_name" value={formData.first_name} placeholder="First Name" required onChange={handleChange} className="w-full p-3 border rounded-lg" />
          </div>

          <div>
            <input name="last_name" value={formData.last_name} placeholder="Last Name" required onChange={handleChange} className="w-full p-3 border rounded-lg" />
          </div>

          <div className="md:col-span-2">
            <input name="phone" value={formData.phone} placeholder="Phone Number (Optional)" onChange={handleChange} className="w-full p-3 border rounded-lg" />
          </div>

          <div>
            <input type="password" value={formData.password} name="password" placeholder="Password" required onChange={handleChange} className="w-full p-3 border rounded-lg" />
          </div>

          <div>
            <input type="password" value={formData.password2} name="password2" placeholder="Confirm Password" required onChange={handleChange} className="w-full p-3 border rounded-lg" />
            {errors.password2 && <p className="text-red-500 text-sm mt-1">{errors.password2}</p>}
          </div>

          <div className="md:col-span-2 mt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-bold hover:underline">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}