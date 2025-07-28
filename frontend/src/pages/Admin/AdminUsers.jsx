import { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';
import { toast } from 'react-toastify';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p>Loading users...</p>;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">All Users</h2>
      <div className="overflow-auto">
        <table className="min-w-full border">
          <thead className="bg-gray-100 text-sm">
            <tr>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Role</th>
              <th className="p-2 border">KYC</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="text-sm text-center">
                <td className="p-2 border">{u.name}</td>
                <td className="p-2 border">{u.email}</td>
                <td className="p-2 border">
                  {u.is_active ? '✅ Active' : '❌ Suspended'}
                </td>
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
    </div>
  );
}
 ;