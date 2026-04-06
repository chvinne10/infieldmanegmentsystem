import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getUnreadNotifications } from '../services/notificationService';
import { useEffect } from 'react';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Load every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await getUnreadNotifications();
      setUnreadCount(data.count || 0);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isManager = user?.role === 'manager' || user?.role === 'admin';

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg hidden md:flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-blue-600">SFWM</h1>
          <p className="text-xs text-gray-500 mt-1">Smart Field Work Manager</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-2">
          <NavLink
            to="/dashboard"
            icon="📊"
            label="Dashboard"
            onClick={() => setMenuOpen(false)}
          />
          <NavLink
            to="/upload"
            icon="📤"
            label="Upload Schedule"
            onClick={() => setMenuOpen(false)}
          />
          {isManager && (
            <NavLink
              to="/manager"
              icon="👥"
              label="Manager Panel"
              onClick={() => setMenuOpen(false)}
            />
          )}
        </nav>

        {/* User Profile */}
        <div className="p-6 border-t border-gray-200">
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-900">{user?.username}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full btn-secondary text-sm"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between p-6">
            <h2 className="text-xl font-semibold text-gray-900">Smart Field Work Manager</h2>
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate('/register')}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Register
              </button>
              {/* Notification Bell */}
              <button
                onClick={() => navigate('/notifications')}
                className="relative text-gray-600 hover:text-gray-900"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Menu Button (Mobile) */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden text-gray-600 hover:text-gray-900"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white p-4 space-y-2">
              <NavLink
                to="/dashboard"
                icon="📊"
                label="Dashboard"
                onClick={() => setMenuOpen(false)}
              />
              <NavLink
                to="/upload"
                icon="📤"
                label="Upload Schedule"
                onClick={() => setMenuOpen(false)}
              />
              {isManager && (
                <NavLink
                  to="/manager"
                  icon="👥"
                  label="Manager Panel"
                  onClick={() => setMenuOpen(false)}
                />
              )}
              <button
                onClick={handleLogout}
                className="w-full btn-secondary text-sm mt-4"
              >
                Logout
              </button>
            </div>
          )}
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">{children}</div>
      </main>
    </div>
  );
}

// Navigation Link Component
function NavLink({ to, icon, label, onClick }) {
  const navigate = useNavigate();
  const location = window.location.pathname;
  const isActive = location === to;

  return (
    <button
      onClick={() => {
        navigate(to);
        onClick?.();
      }}
      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
        isActive
          ? 'bg-blue-100 text-blue-700 font-semibold'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <span className="mr-3">{icon}</span>
      {label}
    </button>
  );
}
