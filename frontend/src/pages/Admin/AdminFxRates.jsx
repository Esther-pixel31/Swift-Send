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
    fee_percent: ''
  });

  const fetchFxRates = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/admin/fx-rates');
      setFxRates(res.data);
    } catch (err) {
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
      fee_percent: fx.fee_percent
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
      fee_percent: ''
    });
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">FX Rates</h2>
        <button
          onClick={() => {
            setEditingFx(null);
            setFormData({
              base_currency: '',
              target_currency: '',
              rate: '',
              fee_percent: ''
            });
            setIsModalOpen(true);
          }}
          className="bg-green-600 text-white px-3 py-1 rounded flex items-center gap-1"
        >
          <Plus size={16} /> New FX Rate
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Base</th>
              <th className="p-2 text-left">Target</th>
              <th className="p-2">Rate</th>
              <th className="p-2">Fee %</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {fxRates.map((fx) => (
              <tr key={fx.id} className="border-t">
                <td className="p-2">{fx.base_currency}</td>
                <td className="p-2">{fx.target_currency}</td>
                <td className="p-2">{fx.rate}</td>
                <td className="p-2">{fx.fee_percent}</td>
                <td className="p-2 space-x-2">
                  <button
                    onClick={() => handleEdit(fx)}
                    className="text-blue-600 hover:underline"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(fx.id)}
                    className="text-red-600 hover:underline"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

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
