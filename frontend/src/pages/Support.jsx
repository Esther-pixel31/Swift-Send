import { useEffect, useState } from 'react';
import { createSupportTicket, getUserSupportTickets } from '../api/support';
import { toast } from 'react-toastify';

export default function Support() {
  const [form, setForm] = useState({ subject: '', message: '' });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await getUserSupportTickets();
      setTickets(res.data);
    } catch {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.subject || !form.message) {
      return toast.warn('Subject and message are required');
    }
    try {
      await createSupportTicket(form);
      toast.success('Support ticket submitted');
      setForm({ subject: '', message: '' });
      fetchTickets(); // refresh list
    } catch {
      toast.error('Failed to submit ticket');
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Support</h2>

      <div className="bg-white p-4 rounded shadow space-y-4">
        <h3 className="text-lg font-medium">Submit a Ticket</h3>
        <input
          type="text"
          placeholder="Subject"
          className="input"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
        />
        <textarea
          rows={4}
          placeholder="Message"
          className="input"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
        <button className="btn" onClick={handleSubmit}>
          Submit
        </button>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-medium">Your Tickets</h3>
        {loading ? (
          <p>Loading...</p>
        ) : tickets.length === 0 ? (
          <p>No tickets submitted yet.</p>
        ) : (
          tickets.map((t) => (
            <div key={t.id} className="bg-white p-4 rounded shadow">
              <p className="font-semibold">{t.subject}</p>
              <p className="text-sm text-gray-600 mb-2">{t.message}</p>
              <p className="text-xs text-gray-500">
                Status: <strong>{t.status}</strong>
              </p>
              {t.response && (
                <p className="text-sm text-green-700 mt-1">
                  📝 <strong>Response:</strong> {t.response}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
