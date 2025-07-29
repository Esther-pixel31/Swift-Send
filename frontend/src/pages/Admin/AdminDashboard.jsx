import { useEffect, useState } from 'react';
import { fetchAdminMetrics, fetchAllUsers } from '../../api/admin';
import { toast } from 'react-toastify';
import {
  Users, CheckCircle, Wallet, Repeat, Search, Sun, Moon, Download,
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

// Inline helper to export CSV
const exportToCSV = (data) => {
  const rows = Object.entries(data).map(([key, value]) => [key, value]);
  const csvContent = 'data:text/csv;charset=utf-8,' +
    rows.map((e) => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'admin_metrics.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const metricIcons = {
  total_users: Users,
  verified_users: CheckCircle,
  total_wallet_balance: Wallet,
  monthly_transfers: Repeat,
};

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [metricsRes, usersRes] = await Promise.all([
          fetchAdminMetrics(),
          fetchAllUsers(),
        ]);
        setMetrics(metricsRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        toast.error('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const cards = [
    {
      label: 'Total Users',
      key: 'total_users',
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300',
      format: (v) => Number(v ?? 0).toLocaleString(),
    },
    {
      label: 'Verified Users',
      key: 'verified_users',
      color: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300',
      format: (v) => Number(v ?? 0).toLocaleString(),
    },
    {
      label: 'Total Wallet Balance',
      key: 'total_wallet_balance',
      color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-300',
      format: (v) => `KES ${Number(v ?? 0).toLocaleString()}`,
    },
    {
      label: 'Monthly Transfers',
      key: 'monthly_transfers',
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300',
      format: (v) => Number(v ?? 0).toLocaleString(),
    },
  ];

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'User Growth',
        data: [100, 150, 300, 500, 650, 800],
        borderColor: '#4f46e5',
        backgroundColor: '#6366f1',
        tension: 0.4,
        fill: false,
      },
    ],
  };

  return (
    <div className="p-6 space-y-6 min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
              />
              <div className="block w-10 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div
                className={`dot absolute left-1 top-1 w-4 h-4 bg-white dark:bg-gray-200 rounded-full transition ${
                  darkMode ? 'translate-x-4' : ''
                }`}
              ></div>
            </div>
            <span className="ml-3 text-sm">
              {darkMode ? <Moon size={18} /> : <Sun size={18} />}
            </span>
          </label>

          <button
            onClick={() => exportToCSV(metrics)}
            className="flex items-center gap-2 text-sm bg-gray-200 dark:bg-gray-700 px-3 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute top-2.5 left-3 text-gray-500" size={18} />
        <input
          type="text"
          placeholder="Search users by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded dark:bg-gray-800 dark:border-gray-700"
        />
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {(loading ? Array(4).fill(null) : cards).map((card, idx) => {
          if (loading) {
            return (
              <div key={idx} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl animate-pulse h-24" />
            );
          }

          const Icon = metricIcons[card.key];
          const value = card.format ? card.format(metrics[card.key]) : metrics[card.key];

          return (
            <div
              key={card.key}
              className={`p-4 rounded-xl shadow hover:scale-[1.02] transition-transform flex items-center gap-4 ${card.color}`}
            >
              <div className="p-3 rounded-full bg-opacity-20">
                <Icon size={24} />
              </div>
              <div>
                <p className="text-sm">{card.label}</p>
                <p className="text-lg font-semibold">{value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-4">User Growth (Monthly)</h3>
        <Line data={chartData} />
      </div>

      {/* Search Results */}
      {search && (
        <div className="mt-4">
          <h4 className="mb-2 text-sm font-medium">Search Results</h4>
          <ul className="divide-y dark:divide-gray-700">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <li key={user.id} className="py-2">
                  <p className="font-medium">{user.email}</p>
                </li>
              ))
            ) : (
              <li className="text-sm text-gray-500 dark:text-gray-400 py-2">No users found.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
