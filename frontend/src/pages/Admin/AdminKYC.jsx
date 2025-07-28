// src/pages/Admin/AdminKYC.jsx
import { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';
import { toast } from 'react-toastify';

export default function AdminKYC() {
  const [kycDocs, setKycDocs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchKYC = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/admin/kyc/pending');
      setKycDocs(res.data);
    } catch {
      toast.error('Failed to load KYC docs');
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id) => {
    try {
      await axios.post(`/admin/kyc/approve/${id}`);
      toast.success('KYC approved');
      fetchKYC();
    } catch {
      toast.error('Approval failed');
    }
  };

  const reject = async (id) => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;
    try {
      await axios.post(`/admin/kyc/reject/${id}`, { reason });
      toast.success('KYC rejected');
      fetchKYC();
    } catch {
      toast.error('Rejection failed');
    }
  };

  const del = async (id) => {
    if (!confirm('Delete this KYC document?')) return;
    try {
      await axios.delete(`/admin/kyc/${id}`);
      toast.success('Deleted');
      fetchKYC();
    } catch {
      toast.error('Failed to delete');
    }
  };

  useEffect(() => {
    fetchKYC();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Pending KYC Reviews</h2>
      {loading ? (
        <p>Loading...</p>
      ) : kycDocs.length === 0 ? (
        <p>No pending KYC documents.</p>
      ) : (
        <div className="grid gap-4">
          {kycDocs.map(doc => (
            <div key={doc.id} className="bg-white p-4 rounded shadow">
              <p><strong>Name:</strong> {doc.user_name}</p>
              <p><strong>Email:</strong> {doc.user_email}</p>
              <p><strong>Document Type:</strong> {doc.doc_type}</p>
              <p><strong>Uploaded:</strong> {new Date(doc.created_at).toLocaleString()}</p>
              <a href={doc.doc_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                View Document
              </a>
              <div className="mt-3 flex gap-2">
                <button onClick={() => approve(doc.id)} className="btn bg-green-600 hover:bg-green-700">Approve</button>
                <button onClick={() => reject(doc.id)} className="btn bg-yellow-500 hover:bg-yellow-600">Reject</button>
                <button onClick={() => del(doc.id)} className="btn bg-red-500 hover:bg-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
