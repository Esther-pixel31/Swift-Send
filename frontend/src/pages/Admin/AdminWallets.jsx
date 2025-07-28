import { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';
import { toast } from 'react-toastify';
import { Pencil, Trash2 } from 'lucide-react';
import EditWalletModal from '../../components/admin/EditWalletModal';

export default function AdminWallets() {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState('');
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [editData, setEditData] = useState({});
  const [sortBy, setSortBy] = useState('id');
  const [order, setOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchWallets = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/admin/wallets', {
        params: {
          page,
          per_page: 10,
          sort_by: sortBy,
          order,
          q: filter,
          currency: currencyFilter
        }
      });
      setWallets(res.data);
      setTotalPages(res.data.total_pages);
    } catch {
      toast.error('Failed to load wallets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, [page, sortBy, order, filter, currencyFilter]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this wallet?')) return;
    try {
      await axios.delete(`/admin/wallets/${id}`);
      toast.success('Wallet deleted');
      fetchWallets();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`/admin/wallets/${selectedWallet.id}`, editData);
      toast.success('Wallet updated');
      setSelectedWallet(null);
      fetchWallets();
    } catch {
      toast.error('Update failed');
    }
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setOrder('asc');
    }
  };

  return (
    <div className="p-4">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <h2 className="text-xl font-semibold">Admin Wallets</h2>
        <input
          type="text"
          placeholder="Filter by email"
          className="border px-2 py-1 rounded"
          value={filter}
          onChange={(e) => {
            setPage(1);
            setFilter(e.target.value);
          }}
        />
        <select
          value={currencyFilter}
          onChange={(e) => {
            setPage(1);
            setCurrencyFilter(e.target.value);
          }}
          className="border px-2 py-1 rounded"
        >
          <option value="">All Currencies</option>
          <option value="KES">KES</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                {[
                  ['User Email', 'user_email'],
                  ['Balance', 'balance'],
                  ['Currency', 'currency'],
                  ['Limits', 'daily_limit'],
                  ['Budget', 'budget'],
                ].map(([label, field]) => (
                  <th
                    key={field}
                    onClick={() => toggleSort(field)}
                    className="p-2 text-left cursor-pointer select-none"
                  >
                    {label} {sortBy === field ? (order === 'asc' ? '▲' : '▼') : ''}
                  </th>
                ))}
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {wallets.map((wallet) => (
                <tr key={wallet.id} className="border-t">
                  <td className="p-2">{wallet.user_email}</td>
                  <td className="p-2">{parseFloat(wallet.balance).toFixed(2)}</td>
                  <td className="p-2">{wallet.currency}</td>
                  <td className="p-2">
                    D: {wallet.daily_limit} | M: {wallet.monthly_limit}
                  </td>
                  <td className="p-2">{wallet.budget}</td>
                  <td className="p-2 space-x-2">
                    <button
                      onClick={() => {
                        setSelectedWallet(wallet);
                        setEditData({
                          balance: wallet.balance,
                          daily_limit: wallet.daily_limit,
                          monthly_limit: wallet.monthly_limit,
                          budget: wallet.budget
                        });
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(wallet.id)}
                      className="text-red-600 hover:underline"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => page > 1 && setPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              onClick={() => page < totalPages && setPage(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {selectedWallet && (
        <EditWalletModal
          wallet={selectedWallet}
          editData={editData}
          setEditData={setEditData}
          onClose={() => setSelectedWallet(null)}
          onSave={handleUpdate}
        />
      )}
    </div>
  );
}
