import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      // Assuming tasks API is built on backend
      const res = await apiClient.get('/api/tasks/');
      setTasks(res.data);
    } catch (err) {
      console.error("Failed to load tasks", err);
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await apiClient.patch(`/api/tasks/${taskId}/`, { status: newStatus });
      fetchTasks(); // Refresh list
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const readTaskOutLoud = (task) => {
    if ('speechSynthesis' in window) {
      const text = `Your next visit is at ${task.time} to ${task.client_name} at ${task.location}. Purpose is ${task.purpose}.`;
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Voice assistant not supported in this browser.");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading your schedule...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Today's Tasks</h1>
          <button 
            onClick={() => { localStorage.clear(); navigate('/login'); }}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        <div className="space-y-4">
          {tasks.length === 0 ? (
            <p className="text-gray-600">No tasks assigned for today. You're all caught up!</p>
          ) : (
            tasks.map(task => (
              <div key={task.id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{task.client_name}</h3>
                  <p className="text-gray-600">📍 {task.location} | 🕒 {task.time}</p>
                  <p className="text-sm text-gray-500 mt-2">Purpose: {task.purpose}</p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${
                    task.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {task.status}
                  </span>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <button 
                    onClick={() => readTaskOutLoud(task)}
                    className="px-4 py-2 bg-purple-500 text-white rounded shadow hover:bg-purple-600 transition"
                  >
                    🔊 Listen
                  </button>
                  {task.status !== 'Completed' && (
                    <button 
                      onClick={() => updateTaskStatus(task.id, 'Completed')}
                      className="px-4 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600 transition"
                    >
                      ✓ Mark Done
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}