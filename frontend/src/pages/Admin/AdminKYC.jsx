import { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';
import { toast } from 'react-toastify';
import { exportKycCSV } from '../../utils/exportToCSV';

export default function AdminKYC() {
  const [kycDocs, setKycDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [previewDoc, setPreviewDoc] = useState(null);

  const fetchKYC = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/admin/kyc/${statusFilter}`);
      setKycDocs(res.data);
    } catch {
      toast.error('Failed to load KYC docs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKYC();
  }, [statusFilter]);

  const approve = async (id) => {
    try {
      await axios.post(`/admin/kyc/approve/${id}`);
      toast.success('Approved');
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
      toast.success('Rejected');
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

  const handleBulkApprove = async () => {
    try {
      await Promise.all(selectedDocs.map((id) => axios.post(`/admin/kyc/approve/${id}`)));
      toast.success('Bulk approved');
      setSelectedDocs([]);
      fetchKYC();
    } catch {
      toast.error('Bulk approval failed');
    }
  };

  const handleBulkReject = async () => {
    const reason = prompt('Reason for rejecting selected documents?');
    if (!reason) return;
    try {
      await Promise.all(
        selectedDocs.map((id) =>
          axios.post(`/admin/kyc/reject/${id}`, { reason })
        )
      );
      toast.success('Bulk rejected');
      setSelectedDocs([]);
      fetchKYC();
    } catch {
      toast.error('Bulk rejection failed');
    }
  };

  const filtered = kycDocs.filter((doc) =>
    doc.user_email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id) => {
    setSelectedDocs((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold">KYC Documents</h2>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            onClick={() => exportKycCSV(filtered, 'kyc_export.csv')}
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          >
            Export CSV
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search by email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md px-4 py-2 border rounded shadow-sm"
      />

      {selectedDocs.length > 0 && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleBulkApprove}
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
          >
            Approve Selected
          </button>
          <button
            onClick={handleBulkReject}
            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
          >
            Reject Selected
          </button>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : filtered.length === 0 ? (
        <p>No KYC documents found.</p>
      ) : (
        <div className="grid gap-4">
          {filtered.map((doc) => (
            <div key={doc.id} className="p-4 border rounded-lg bg-white shadow">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <input
                    type="checkbox"
                    checked={selectedDocs.includes(doc.id)}
                    onChange={() => toggleSelect(doc.id)}
                  />
                  <p><strong>{doc.user_name}</strong></p>
                  <p className="text-sm text-gray-600">{doc.user_email}</p>
                  <p className="text-sm">Type: {doc.doc_type}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(doc.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setPreviewDoc(doc)}
                  className="text-blue-600 hover:underline"
                >
                  Preview
                </button>
              </div>

              <div className="mt-3 flex gap-2">
                {statusFilter === 'pending' && (
                  <>
                    <button
                      onClick={() => approve(doc.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => reject(doc.id)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => del(doc.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 📄 Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-3xl p-4 rounded shadow-xl relative">
            <button
              onClick={() => setPreviewDoc(null)}
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
            >
              ✖
            </button>
            <h3 className="text-lg font-semibold mb-2">
              {previewDoc.doc_type} - {previewDoc.user_email}
            </h3>
            <iframe
              src={previewDoc.doc_url}
              title="KYC Document"
              className="w-full h-[70vh] border"
            />
          </div>
        </div>
      )}
    </div>
  );
}
