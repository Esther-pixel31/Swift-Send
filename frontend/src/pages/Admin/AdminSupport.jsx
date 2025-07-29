import { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';
import { toast } from 'react-toastify';
import ViewTicketModal from '../../components/admin/ViewTicketModal';
import { Mail, Tag, CheckCircle, XCircle } from 'lucide-react';


export default function AdminSupportPage() {
  const [tickets, setTickets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(searchQuery), 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/admin/support/tickets`, {
        params: {
          page: currentPage,
          per_page: 10,
          status: statusFilter,
          search: debouncedQuery,
        },
      });
      setTickets(res.data.tickets);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [currentPage, statusFilter, debouncedQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, debouncedQuery]);

  const handleClose = async (id) => {
    try {
      await axios.put(`/admin/support/tickets/${id}`, { status: 'closed' });
      toast.success('Ticket closed');
      fetchTickets();
    } catch {
      toast.error('Failed to close ticket');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;
    try {
      await axios.delete(`/admin/support/tickets/${id}`);
      toast.success('Ticket deleted');
      fetchTickets();
    } catch {
      toast.error('Failed to delete ticket');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by email or ID"
          className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gray-50 text-gray-800 font-semibold text-left">
            <tr>
              <th className="px-5 py-3 border-b">Ticket ID</th>
              <th className="px-5 py-3 border-b">Email</th>
              <th className="px-5 py-3 border-b">Subject</th>
              <th className="px-5 py-3 border-b">Status</th>
              <th className="px-5 py-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-400">
                  No tickets found.
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 border-b">{ticket.id}</td>
                  <td className="px-5 py-4 border-b">{ticket.email}</td>
                  <td className="px-5 py-4 border-b">{ticket.subject}</td>
                  <td className="px-5 py-4 border-b capitalize">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        ticket.status === 'closed'
                          ? 'bg-gray-200 text-gray-700'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 border-b space-x-3">
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="text-indigo-600 hover:underline font-medium"
                    >
                      View
                    </button>
                    {ticket.status !== 'closed' && (
                      <button
                        onClick={() => handleClose(ticket.id)}
                        className="text-yellow-600 hover:underline font-medium"
                      >
                        Close
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(ticket.id)}
                      className="text-red-600 hover:underline font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      {selectedTicket && (
        <ViewTicketModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdate={fetchTickets}
        />
      )}
    </div>
  );
}
