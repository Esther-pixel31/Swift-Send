import { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';
import { toast } from 'react-toastify';
import ViewTicketModal from '../../components/admin/ViewTicketModal';

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchTickets = async () => {
    try {
      const res = await axios.get(`/admin/support/tickets`, {
        params: {
            page: currentPage,
            per_page: 10, // or whatever value you want
            status: statusFilter,
            search: searchQuery,
        },
        });

      setTickets(res.data.tickets);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      toast.error('Failed to fetch tickets');
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [currentPage, statusFilter, searchQuery]);

  const handleClose = async (id) => {
    try {
      await axios.put(`/admin/support/tickets/${id}`, { status: 'closed' }
    );
      toast.success('Ticket closed');
      fetchTickets();
    } catch {
      toast.error('Failed to close ticket');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/admin/support/tickets/${id}`);

      toast.success('Ticket deleted');
      fetchTickets();
    } catch {
      toast.error('Failed to delete ticket');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by email or ID"
          className="border px-3 py-2 rounded w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3 border">Ticket ID</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Subject</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="border-t">
                <td className="p-3 border">{ticket.id}</td>
                <td className="p-3 border">{ticket.email}</td>
                <td className="p-3 border">{ticket.subject}</td>
                <td className="p-3 border capitalize">{ticket.status}</td>
                <td className="p-3 border space-x-2">
                  <button
                    onClick={() => setSelectedTicket(ticket)}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </button>
                  {ticket.status !== 'closed' && (
                    <button
                      onClick={() => handleClose(ticket.id)}
                      className="text-yellow-600 hover:underline"
                    >
                      Close
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(ticket.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {tickets.length === 0 && (
          <p className="text-center text-gray-500 mt-4">No tickets found.</p>
        )}
      </div>

      <div className="flex justify-between items-center mt-4">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {selectedTicket && (
        <ViewTicketModal
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
            onUpdate={fetchTickets} // ✅ now it's defined
            />

      )}
    </div>
  );
}
