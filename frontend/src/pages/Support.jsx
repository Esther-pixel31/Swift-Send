import { useEffect, useState } from 'react';
import { createSupportTicket, getUserSupportTickets } from '../api/support';
import { toast } from 'react-toastify';

export default function Support() {
  const [form, setForm] = useState({ subject: '', message: '' });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

    setSubmitting(true);
    try {
      await createSupportTicket(form);
      toast.success('Support ticket submitted');
      setForm({ subject: '', message: '' });
      fetchTickets();
    } catch {
      toast.error('Failed to submit ticket');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const renderStatusBadge = (status) => {
    const base = "px-2 py-1 rounded-full text-xs font-medium inline-block";
    switch (status.toLowerCase()) {
      case 'resolved':
        return <span className={`${base} bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200`}>Resolved</span>;
      case 'pending':
        return <span className={`${base} bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200`}>Pending</span>;
      case 'closed':
        return <span className={`${base} bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300`}>Closed</span>;
      default:
        return <span className={`${base} bg-zinc-300 text-zinc-700 dark:bg-zinc-700 dark:text-white`}>{status}</span>;
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto text-textDark dark:text-white">
      <h2 className="text-2xl font-semibold mb-6">🛠️ Support</h2>

      <div className="bg-white dark:bg-zinc-800 p-4 sm:p-6 rounded-2xl shadow-md space-y-4">
        <h3 className="text-lg font-medium">Submit a Ticket</h3>

        <input
          type="text"
          placeholder="Subject"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
        />

        <textarea
          rows={4}
          placeholder="Describe your issue"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
        />

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className={`w-full py-3 rounded-md text-white font-medium transition ${
            submitting ? 'bg-accent/60 cursor-not-allowed' : 'bg-primary hover:bg-accent'
          }`}
        >
          {submitting ? 'Submitting...' : 'Submit Ticket'}
        </button>
      </div>

      <div className="mt-8 space-y-4">
        <h3 className="text-lg font-medium">Your Tickets</h3>

        {loading ? (
          <p className="text-gray-500 dark:text-zinc-400">Loading...</p>
        ) : tickets.length === 0 ? (
          <p className="text-gray-500 dark:text-zinc-400">No tickets submitted yet.</p>
        ) : (
          tickets.map((t) => (
            <div
              key={t.id}
              className="bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-700"
            >
              <p className="font-semibold">{t.subject}</p>
              <p className="text-sm text-gray-600 dark:text-zinc-400 mb-2">{t.message}</p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  Status: {renderStatusBadge(t.status)}
                </p>
                {t.response && (
                  <p className="text-sm text-green-700 dark:text-green-300">
                    📝 <strong>Response:</strong> {t.response}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
