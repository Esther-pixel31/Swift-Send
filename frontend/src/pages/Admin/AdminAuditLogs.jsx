import { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/admin/audit-logs');
      setLogs(res.data);
    } catch {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Audit Logs</h2>

      {loading ? (
        <p>Loading...</p>
      ) : logs.length === 0 ? (
        <p>No logs found.</p>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full text-sm border">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2">User</th>
                <th className="p-2">Action</th>
                <th className="p-2">Time</th>
                <th className="p-2">Metadata</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t">
                  <td className="p-2">{log.user}</td>
                  <td className="p-2">{log.action}</td>
                  <td className="p-2">{dayjs(log.created_at).format('YYYY-MM-DD HH:mm:ss')}</td>
                  <td className="p-2 whitespace-pre-wrap text-xs">
                    {log.metadata
                      ? JSON.stringify(log.metadata, null, 2)
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
