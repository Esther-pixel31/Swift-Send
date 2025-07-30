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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Wallet Management</h1>
        <p className="text-sm text-gray-500">View, edit, and delete user wallets.</p>
      </div>

      <div className="bg-white shadow-md rounded-lg p-4">
        <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
          <input
            type="text"
            placeholder="Filter by email"
            className="border px-3 py-2 rounded text-sm"
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
            className="border px-3 py-2 rounded text-sm"
          >
            <option value="">All Currencies</option>
            <option value="KES">KES</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>

        {loading ? (
          <p className="text-center text-gray-600 py-4">Loading wallets...</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border">
                <thead className="bg-gray-100 text-xs text-gray-600 uppercase">
                  <tr>
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
                        className="p-3 text-left cursor-pointer select-none"
                      >
                        {label}{' '}
                        {sortBy === field ? (order === 'asc' ? '▲' : '▼') : ''}
                      </th>
                    ))}
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {wallets.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-gray-500">
                        No wallets found.
                      </td>
                    </tr>
                  ) : (
                    wallets.map((wallet, i) => (
                      <tr key={wallet.id} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="p-3">{wallet.user_email}</td>
                        <td className="p-3">{parseFloat(wallet.balance).toFixed(2)}</td>
                        <td className="p-3">{wallet.currency}</td>
                        <td className="p-3">
                          D: {wallet.daily_limit} | M: {wallet.monthly_limit}
                        </td>
                        <td className="p-3">{wallet.budget}</td>
                        <td className="p-3 space-x-2">
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
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center mt-6 space-x-3">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                ⏮ First
              </button>
              <button
                onClick={() => page > 1 && setPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                ← Prev
              </button>
              <span className="text-sm px-2 py-1 border rounded text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => page < totalPages && setPage(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Next →
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Last ⏭
              </button>
            </div>
          </>
        )}
      </div>

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
