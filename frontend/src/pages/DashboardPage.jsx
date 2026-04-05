import React, { useState, useEffect } from 'react';
import { getTodayTasks, getTaskStats, markTaskComplete, skipTask } from '../services/taskService';
import { formatTime, isOverdue } from '../utils/dateUtils';
import { getStatusColor, getPriorityColor } from '../utils/constants';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    total_tasks: 0,
    completed_tasks: 0,
    pending_tasks: 0,
    overdue_tasks: 0,
    today_tasks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksData, statsData] = await Promise.all([
        getTodayTasks(),
        getTaskStats(),
      ]);
      setTasks(tasksData.results || []);
      setStats(statsData);
    } catch (error) {
      toast.error('Failed to load tasks');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (taskId) => {
    try {
      await markTaskComplete(taskId);
      toast.success('Task marked as completed!');
      loadData();
    } catch (error) {
      toast.error('Failed to complete task');
    }
  };

  const handleSkip = async (taskId) => {
    try {
      await skipTask(taskId);
      toast.success('Task skipped');
      loadData();
    } catch (error) {
      toast.error('Failed to skip task');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here are your tasks for today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total Tasks', value: stats.total_tasks, color: 'blue' },
          { label: 'Today Tasks', value: stats.today_tasks, color: 'green' },
          { label: 'Completed', value: stats.completed_tasks, color: 'teal' },
          { label: 'Pending', value: stats.pending_tasks, color: 'yellow' },
          { label: 'Overdue', value: stats.overdue_tasks, color: 'red' },
        ].map((stat, idx) => (
          <div
            key={idx}
            className={`card bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100 border-${stat.color}-200`}
          >
            <p className={`text-${stat.color}-600 text-sm font-medium`}>{stat.label}</p>
            <p className={`text-${stat.color}-900 text-3xl font-bold mt-2`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tasks List */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Today's Tasks</h2>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No tasks for today</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 border rounded-lg hover:shadow-md transition-shadow ${
                  isOverdue(task.scheduled_time)
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">{task.title}</h3>
                      <span className="text-sm font-medium text-gray-600">
                        {formatTime(task.scheduled_time)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{task.client_name}</p>
                    <p className="text-gray-500 text-sm">{task.location}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMarkComplete(task.id)}
                      className="btn-primary text-sm"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => handleSkip(task.id)}
                      className="btn-secondary text-sm"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
