import { useEffect, useState } from 'react';
import { fetchAdminMetrics } from '../../api/admin';
import { toast } from 'react-toastify';
import {
  Users,
  CheckCircle,
  Wallet,
  Repeat
} from 'lucide-react';

const metricIcons = {
  total_users: Users,
  verified_users: CheckCircle,
  total_wallet_balance: Wallet,
  monthly_transfers: Repeat,
};

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const res = await fetchAdminMetrics();
        setMetrics(res.data);
      } catch {
        toast.error('Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, []);

  if (loading) return <div className="p-6">Loading metrics...</div>;
  if (!metrics) return <div className="p-6 text-red-600">No metrics available</div>;

  const cards = [
    {
      label: 'Total Users',
      key: 'total_users',
      color: 'text-blue-600 bg-blue-100',
    },
    {
      label: 'Verified Users',
      key: 'verified_users',
      color: 'text-green-600 bg-green-100',
    },
    {
      label: 'Total Wallet Balance',
      key: 'total_wallet_balance',
      color: 'text-indigo-600 bg-indigo-100',
      format: (v) => `KES ${Number(v).toLocaleString()}`
    },
    {
      label: 'Monthly Transfers',
      key: 'monthly_transfers',
      color: 'text-purple-600 bg-purple-100',
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, key, color, format }) => {
          const Icon = metricIcons[key];
          const value = format ? format(metrics[key]) : metrics[key];
          return (
            <div key={key} className="bg-white p-4 rounded-xl shadow flex items-center gap-4">
              <div className={`p-3 rounded-full ${color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">{label}</p>
                <p className="text-lg font-semibold">{value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
