import { useEffect, useState } from 'react';
import {
  getReceivedRequests,
  fulfillPaymentRequest,
  declinePaymentRequest
} from '../api/transfer';
import { toast } from 'react-toastify';

export default function IncomingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await getReceivedRequests();
      setRequests(res.data);
    } catch (err) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleFulfill = async (id) => {
    if (!window.confirm('Send money to fulfill this request?')) return;
    try {
      await fulfillPaymentRequest(id);
      toast.success('Request fulfilled');
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to fulfill request');
    }
  };

  const handleDecline = async (id) => {
    if (!window.confirm('Decline this payment request?')) return;
    try {
      await declinePaymentRequest(id);
      toast.success('Request declined');
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to decline request');
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold">📥 Incoming Payment Requests</h2>

      {loading ? (
        <p>Loading...</p>
      ) : requests.length === 0 ? (
        <p className="text-gray-500">No pending requests</p>
      ) : (
        requests.map((req) => (
          <div key={req.id} className="border rounded-lg p-4 shadow">
            <p>
              <strong>From:</strong> {req.requester_name} ({req.requester_email})
            </p>
            <p>
              <strong>Amount:</strong> {req.amount} {req.currency}
            </p>
            {req.note && (
              <p>
                <strong>Note:</strong> {req.note}
              </p>
            )}
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => handleFulfill(req.id)}
                className="btn bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                Fulfill
              </button>
              <button
                onClick={() => handleDecline(req.id)}
                className="btn bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Decline
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
