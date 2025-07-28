import { useState } from 'react';
import axios from '../../utils/axiosInstance';
import { toast } from 'react-toastify';
import { X } from 'lucide-react';

export default function ViewTicketModal({ ticket, onClose, onUpdate }) {
  const [reply, setReply] = useState('');
  const [status, setStatus] = useState(ticket.status);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reply.trim() && status === ticket.status) {
      return toast.error('Nothing to update');
    }

    try {
      setLoading(true);
      await axios.put(`/admin/support/tickets/${ticket.id}`, {
        ...(reply.trim() && { response: reply.trim() }),
        ...(status !== ticket.status && { status }),
      });

      toast.success('Ticket updated');
      setReply('');
      onUpdate(); // refresh parent list
      onClose();  // close modal
    } catch (err) {
      console.error(err);
      toast.error('Failed to update ticket');
    } finally {
      setLoading(false);
    }
  };
  


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
      <div className="bg-white rounded-xl w-full max-w-2xl p-6 space-y-4 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <X size={20} />
        </button>

        <h3 className="text-xl font-semibold">Ticket: {ticket.subject}</h3>

        <div className="border p-3 rounded bg-gray-50 text-sm">
          <p><span className="font-medium">User:</span> {ticket.user_email}</p>
          <p><span className="font-medium">Status:</span> {status}</p>
          <p><span className="font-medium">Created At:</span> {new Date(ticket.created_at).toLocaleString()}</p>
        </div>

        {ticket.message && (
          <div className="border rounded bg-gray-50 p-3">
            <p className="text-sm whitespace-pre-line">{ticket.message}</p>
          </div>
        )}

        {ticket.response && (
          <div className="border rounded bg-green-50 p-3">
            <p className="font-semibold text-sm">Admin Response:</p>
            <p className="text-sm whitespace-pre-line">{ticket.response}</p>
          </div>
        )}

        <div className="space-y-2">
          <textarea
            rows={3}
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="Type your reply..."
            value={reply}
            onChange={(e) => setReply(e.target.value)}
          />
        </div>

        <div className="pt-2 border-t">
          <label className="block text-sm font-medium mb-1">Update Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border px-3 py-2 rounded w-full text-sm"
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Updating...' : 'Submit'}
        </button>
      </div>
    </div>
  );
}
