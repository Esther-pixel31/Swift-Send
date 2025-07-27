import { useEffect, useState } from 'react';
import axios from '../utils/axiosInstance';
import { jwtDecode } from 'jwt-decode';
import { Bell } from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import { toast } from 'react-toastify';
import {
  Chart as ChartJS,
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(LineElement, ArcElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function Dashboard() {
  const [wallet, setWallet] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [userName, setUserName] = useState('User');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserName(decoded?.name || 'User');
      } catch (err) {
        console.warn('Token decode failed:', err);
      }
    }

    const fetchData = async () => {
      try {
        const walletRes = await axios.get('/wallet');
        const txRes = await axios.get('/history/my-transactions');
        setWallet(walletRes.data);
        setTransactions(txRes.data.slice(0, 10));
      } catch (err) {
        toast.error('Error loading dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const spendingChart = {
    labels: transactions.map((t) => new Date(t.created_at).toLocaleDateString()).reverse(),
    datasets: [{
      label: 'KES Spent',
      data: transactions.map((t) => t.amount).reverse(),
      borderColor: '#6366F1',
      fill: false,
      tension: 0.3,
    }],
  };

  const categoryChart = {
    labels: ['Transfer', 'Withdraw', 'Bill', 'Top-up'],
    datasets: [{
      label: 'Category Spend',
      data: [2000, 1000, 1500, 500],
      backgroundColor: ['#4F46E5', '#EF4444', '#10B981', '#F59E0B'],
    }]
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Hi, {userName} 👋</h2>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-6 shadow-lg">
        <p className="text-sm opacity-80">Current Balance</p>
        <h3 className="text-3xl font-bold mt-1">{wallet.currency} {wallet.balance?.toFixed(2)}</h3>
        <p className="text-sm mt-2 opacity-80">Last updated: just now</p>
      </div>

      {/* Limit Progress */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl shadow space-y-2">
          <p className="text-sm text-gray-500">Spending Limits</p>
          <div>
            <p className="text-xs">Daily</p>
            <div className="w-full bg-gray-200 h-2 rounded">
              <div className="bg-blue-500 h-2 rounded" style={{ width: '60%' }} />
            </div>
          </div>
          <div>
            <p className="text-xs">Monthly</p>
            <div className="w-full bg-gray-200 h-2 rounded">
              <div className="bg-green-500 h-2 rounded" style={{ width: '35%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <h4 className="font-medium mb-2">Spending Trend</h4>
          <Line data={spendingChart} />
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h4 className="font-medium mb-2">Spending by Category</h4>
          <Doughnut data={categoryChart} />
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h4 className="font-medium mb-3">Recent Transactions</h4>
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-sm">No recent transactions.</p>
        ) : (
          <ul className="divide-y">
            {transactions.slice(0, 5).map((tx) => (
              <li key={tx.id} className="flex justify-between py-2 text-sm">
                <span>{tx.transaction_type}</span>
                <span>{tx.amount} {tx.currency}</span>
                <span className="text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
