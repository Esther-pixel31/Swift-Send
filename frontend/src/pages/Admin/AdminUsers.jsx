import { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';
import { toast } from 'react-toastify';
import { exportToCSV } from '../../utils/exportToCSV';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/admin/users');
      setUsers(res.data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleReactivate = async (id) => {
    try {
      await axios.post(`/admin/users/${id}/reactivate`);
      toast.success('User reactivated');
      fetchUsers();
    } catch {
      toast.error('Failed to reactivate user');
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      await axios.put(`/admin/users/${id}`, updates);
      toast.success('User updated');
      fetchUsers();
    } catch {
      toast.error('Failed to update user');
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this user?');
    if (!confirmed) return;

    try {
      await axios.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  if (loading) return <p>Loading users...</p>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-semibold">All Users</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="border px-3 py-2 rounded shadow-sm"
          />
          <button
            onClick={() => exportToCSV(filteredUsers)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Export CSV
          </button>
          {selectedUserIds.length > 0 && (
            <button
              onClick={async () => {
                const confirm = window.confirm(`Delete ${selectedUserIds.length} users?`);
                if (!confirm) return;
                try {
                  await Promise.all(
                    selectedUserIds.map((id) => axios.delete(`/admin/users/${id}`))
                  );
                  toast.success('Users deleted');
                  fetchUsers();
                  setSelectedUserIds([]);
                } catch {
                  toast.error('Bulk delete failed');
                }
              }}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Delete Selected
            </button>
          )}
        </div>
      </div>

      <div className="overflow-auto">
        <table className="min-w-full border">
          <thead className="bg-gray-100 text-sm">
            <tr>
              <th className="p-2 border">
                <input
                  type="checkbox"
                  checked={selectedUserIds.length === paginatedUsers.length}
                  onChange={(e) =>
                    setSelectedUserIds(
                      e.target.checked ? paginatedUsers.map((u) => u.id) : []
                    )
                  }
                />
              </th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Role</th>
              <th className="p-2 border">KYC</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((u) => (
              <tr key={u.id} className="text-sm text-center">
                <td className="p-2 border">
                  <input
                    type="checkbox"
                    checked={selectedUserIds.includes(u.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUserIds([...selectedUserIds, u.id]);
                      } else {
                        setSelectedUserIds(selectedUserIds.filter((id) => id !== u.id));
                      }
                    }}
                  />
                </td>
                <td
                  className="p-2 border cursor-pointer text-blue-600 hover:underline"
                  onClick={() => setSelectedUser(u)}
                >
                  {u.name}
                </td>
                <td className="p-2 border">{u.email}</td>
                <td className="p-2 border">{u.is_active ? '✅ Active' : '❌ Suspended'}</td>
                <td className="p-2 border">{u.role}</td>
                <td className="p-2 border">{u.kyc_status}</td>
                <td className="p-2 border space-x-2">
                  {!u.is_active && (
                    <button
                      onClick={() => handleReactivate(u.id)}
                      className="text-green-600 hover:underline"
                    >
                      Reactivate
                    </button>
                  )}
                  <button
                    onClick={() =>
                      handleUpdate(u.id, {
                        role: u.role === 'admin' ? 'user' : 'admin',
                      })
                    }
                    className="text-blue-600 hover:underline"
                  >
                    Make {u.role === 'admin' ? 'User' : 'Admin'}
                  </button>
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {[...Array(totalPages)].map((_, i) => {
            const page = i + 1;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>
      )}

      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded p-6 w-full max-w-md space-y-4">
            <h3 className="text-xl font-semibold">User Details</h3>
            <p><strong>Name:</strong> {selectedUser.name}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Status:</strong> {selectedUser.is_active ? 'Active' : 'Suspended'}</p>
            <p><strong>Role:</strong> {selectedUser.role}</p>
            <p><strong>KYC:</strong> {selectedUser.kyc_status}</p>
            <button
              onClick={() => setSelectedUser(null)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
