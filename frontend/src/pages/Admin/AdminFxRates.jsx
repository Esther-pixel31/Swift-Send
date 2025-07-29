import { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';
import { toast } from 'react-toastify';
import { Pencil, Trash2, Plus } from 'lucide-react';
import FxRateModal from '../../components/admin/FxRateModal';

export default function AdminFxRates() {
  const [fxRates, setFxRates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingFx, setEditingFx] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    base_currency: '',
    target_currency: '',
    rate: '',
    fee_percent: '',
  });

  const fetchFxRates = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/admin/fx-rates');
      setFxRates(res.data);
    } catch {
      toast.error('Failed to load FX rates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFxRates();
  }, []);

  const handleSave = async () => {
    try {
      if (editingFx) {
        await axios.put(`/admin/fx-rates/${editingFx.id}`, {
          rate: formData.rate,
          fee_percent: formData.fee_percent,
        });
        toast.success('FX rate updated');
      } else {
        await axios.post('/admin/fx-rates', formData);
        toast.success('FX rate created');
      }
      fetchFxRates();
      handleCloseModal();
    } catch {
      toast.error('Failed to save FX rate');
    }
  };

  const handleEdit = (fx) => {
    setEditingFx(fx);
    setFormData({
      base_currency: fx.base_currency,
      target_currency: fx.target_currency,
      rate: fx.rate,
      fee_percent: fx.fee_percent,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this FX rate?')) return;
    try {
      await axios.delete(`/admin/fx-rates/${id}`);
      toast.success('FX rate deleted');
      fetchFxRates();
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFx(null);
    setFormData({
      base_currency: '',
      target_currency: '',
      rate: '',
      fee_percent: '',
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">FX Rates</h2>
        <button
          onClick={() => {
            setEditingFx(null);
            setFormData({
              base_currency: '',
              target_currency: '',
              rate: '',
              fee_percent: '',
            });
            setIsModalOpen(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2 text-sm"
        >
          <Plus size={16} /> New FX Rate
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        {loading ? (
          <p className="text-center text-gray-600 p-4">Loading FX rates...</p>
        ) : fxRates.length === 0 ? (
          <p className="text-center text-gray-500 p-4">No FX rates found.</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                <th className="p-3 text-left">Base</th>
                <th className="p-3 text-left">Target</th>
                <th className="p-3 text-left">Rate</th>
                <th className="p-3 text-left">Fee %</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fxRates.map((fx, index) => (
                <tr key={fx.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="p-3 text-left">{fx.base_currency}</td>
                  <td className="p-3 text-left">{fx.target_currency}</td>
                  <td className="p-3 text-left">{fx.rate}</td>
                  <td className="p-3 text-left">{fx.fee_percent}</td>
                  <td className="p-3 text-left space-x-2">
                    <button
                      onClick={() => handleEdit(fx)}
                      className="text-blue-600 hover:underline"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(fx.id)}
                      className="text-red-600 hover:underline"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <FxRateModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        formData={formData}
        setFormData={setFormData}
        editingFx={editingFx}
      />
    </div>
  );
}
