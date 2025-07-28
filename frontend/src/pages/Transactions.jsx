import { useEffect, useState } from 'react';
import { fetchTransactions, downloadTransactions } from '../api/transactions';
import { toast } from 'react-toastify';

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
      const blob = new Blob([res.data], { type: format === 'pdf' ? 'application/pdf' : 'text/csv' });
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
          {dropdown && (
            <div className="absolute right-0 mt-2 bg-white border shadow rounded w-32 z-10">
              <button onClick={() => handleDownload('csv')} className="w-full text-left px-4 py-2 hover:bg-gray-100">CSV</button>
              <button onClick={() => handleDownload('pdf')} className="w-full text-left px-4 py-2 hover:bg-gray-100">PDF</button>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="border rounded px-2 py-1">
          <option value="">All Types</option>
          <option value="credit">Credit</option>
          <option value="debit">Debit</option>
        </select>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border rounded px-2 py-1" />
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border rounded px-2 py-1" />
        <button onClick={fetchFilteredTransactions} className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">Filter</button>
      </div>

      {loading ? (
        <p>Loading transactions...</p>
      ) : txns.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <div className="grid gap-3">
          {txns.map(tx => (
            <div key={tx.id} className="bg-white p-4 rounded shadow-sm">
              <div className="flex justify-between">
                <span className="font-semibold">{tx.transaction_type.toUpperCase()}</span>
                <span>{new Date(tx.created_at).toLocaleString()}</span>
              </div>
              <p>{tx.amount} {tx.currency}</p>
              <p className="text-sm text-gray-600">{tx.note}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
