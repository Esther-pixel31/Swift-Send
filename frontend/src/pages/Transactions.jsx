import { useEffect, useState } from 'react';
import { fetchTransactions, downloadTransactions } from '../api/transactions';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

export default function Transactions() {
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchFilteredTransactions = async () => {
    setLoading(true);
    try {
      const params = {
        ...(typeFilter && { type: typeFilter }),
        ...(startDate && { start: startDate }),
        ...(endDate && { end: endDate }),
      };
      const res = await fetchTransactions(params);
      setTxns(res.data);
    } catch {
      toast.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredTransactions();
  }, []);

  const handleDownload = async (format) => {
    try {
      const res = await downloadTransactions(format);
      const blob = new Blob([res.data], {
        type: format === 'pdf' ? 'application/pdf' : 'text/csv',
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `transactions.${format}`;
      link.click();
      toast.success(`Downloaded as ${format.toUpperCase()}`);
      setDropdown(false);
    } catch {
      toast.error('Download failed');
    }
  };

  const clearFilters = () => {
    setTypeFilter('');
    setStartDate('');
    setEndDate('');
    fetchFilteredTransactions();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">My Transactions</h2>
        <div className="relative">
          <button
            onClick={() => setDropdown(!dropdown)}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition"
          >
            Download ▼
          </button>

          <AnimatePresence>
            {dropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 bg-white border shadow rounded w-32 z-10"
              >
                <button
                  onClick={() => handleDownload('csv')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  CSV
                </button>
                <button
                  onClick={() => handleDownload('pdf')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  PDF
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white p-4 rounded-xl shadow flex flex-wrap gap-4 items-end"
      >
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Type</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="">All</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-600">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={clearFilters}
            className="text-sm underline text-gray-600 hover:text-black"
          >
            Clear
          </button>
          <button
            onClick={fetchFilteredTransactions}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Apply
          </button>
        </div>
      </motion.div>

      {/* Transactions */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="bg-white rounded-xl p-4 shadow animate-pulse space-y-2"
            >
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-5 bg-gray-300 rounded w-2/3" />
              <div className="h-3 bg-gray-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : txns.length === 0 ? (
        <p className="text-gray-500">No transactions found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {txns.map((tx) => (
            <div
              key={tx.id}
              className={`flex items-start gap-4 p-4 rounded-xl border shadow-sm ${
                tx.transaction_type === 'credit'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex-shrink-0 mt-1 text-xl">
                {tx.transaction_type === 'credit' ? '➕' : '➖'}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h4 className="text-md font-semibold text-gray-900">
                    {tx.note || 'Transaction'}
                  </h4>
                  <span
                    className={`text-sm font-medium px-2 py-1 rounded-full ${
                      tx.transaction_type === 'credit'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {tx.transaction_type.toUpperCase()}
                  </span>
                </div>
                <p className="text-lg font-bold text-gray-800 mt-1">
                  {tx.amount} {tx.currency}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(tx.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
