import { useEffect, useState } from 'react';
import { fetchAllUsers, updateUser, deleteUser } from '../../api/admin';
import { toast } from 'react-toastify';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetchAllUsers();
      setUsers(res.data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleStatus = async (user) => {
    try {
      await updateUser(user.id, { is_active: !user.is_active });
      toast.success(`${user.name} ${user.is_active ? 'deactivated' : 'reactivated'}`);
      loadUsers();
    } catch {
      toast.error('Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(id);
      toast.success('User deleted');
      loadUsers();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">All Users</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full bg-white rounded-xl shadow overflow-hidden">
          <thead className="bg-gray-100 text-left text-sm">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">KYC</th>
              <th className="p-3">Verified</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t text-sm hover:bg-gray-50">
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.kyc_status}</td>
                <td className="p-3">{u.is_verified ? '✅' : '❌'}</td>
                <td className="p-3">{u.is_active ? 'Active' : 'Suspended'}</td>
                <td className="p-3 space-x-2">
                  <button
                    onClick={() => handleToggleStatus(u)}
                    className={`px-2 py-1 rounded text-xs ${
                      u.is_active ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                    }`}
                  >
                    {u.is_active ? 'Suspend' : 'Reactivate'}
                  </button>
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
