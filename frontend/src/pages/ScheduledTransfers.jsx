import { useEffect, useState } from 'react';
import { getScheduledTransfers, cancelScheduledTransfer } from '../api/transfer';
import { toast } from 'react-toastify';

export default function ScheduledTransfers() {
  const [scheduled, setScheduled] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadScheduled = async () => {
    setLoading(true);
    try {
      const res = await getScheduledTransfers();
      setScheduled(res.data);
    } catch {
      toast.error('Failed to load scheduled transfers');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this scheduled transfer?')) return;
    try {
      await cancelScheduledTransfer(id);
      toast.success('Transfer canceled');
      setScheduled((prev) => prev.filter((tx) => tx.id !== id));
    } catch {
      toast.error('Failed to cancel');
    }
  };

  useEffect(() => {
    loadScheduled();
  }, []);

  return (
    <div className="p-6 space-y-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800">📅 Scheduled Transfers</h2>

      {loading ? (
        <div>Loading...</div>
      ) : scheduled.length === 0 ? (
        <div className="text-gray-500">No upcoming scheduled transfers</div>
      ) : (
        <div className="bg-white p-4 rounded-xl shadow space-y-4">
          {scheduled.map((tx) => (
            <div key={tx.id} className="border-b pb-4">
              <div><strong>To:</strong> {tx.beneficiary?.name || 'N/A'} ({tx.beneficiary?.email || 'N/A'})</div>
              <div><strong>Amount:</strong> {tx.amount} {tx.currency}</div>
              <div><strong>Scheduled At:</strong> {new Date(tx.scheduled_at).toLocaleString()}</div>
              <div><strong>Status:</strong> <span className="text-blue-600">{tx.status}</span></div>
              {tx.recurrence && <div><strong>Repeats:</strong> {tx.recurrence}</div>}
              <button
                onClick={() => handleCancel(tx.id)}
                className="btn mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
              >
                Cancel
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
