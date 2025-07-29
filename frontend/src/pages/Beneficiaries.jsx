import { useEffect, useState } from 'react';
import {
  getBeneficiaries,
  addBeneficiary,
  deleteBeneficiary,
  toggleFavorite,
} from '../api/beneficiaries';
import { toast } from 'react-toastify';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function Beneficiaries() {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone_number: '',
    bank_account_number: '',
    bank_name: '',
    group: '',
    currency: 'KES',
    is_favorite: false,
  });
  const [loading, setLoading] = useState(false);
  const [openId, setOpenId] = useState(null); // Track open beneficiary on mobile

  const loadBeneficiaries = async () => {
    setLoading(true);
    try {
      const res = await getBeneficiaries();
      setBeneficiaries(res.data || []);
    } catch {
      toast.error('Failed to load beneficiaries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBeneficiaries();
  }, []);

  const handleAdd = async () => {
    if (!form.name || !form.phone_number) {
      return toast.warn('Name and phone number are required');
    }
    try {
      await addBeneficiary(form);
      toast.success('Beneficiary added');
      setForm({
        name: '',
        email: '',
        phone_number: '',
        bank_account_number: '',
        bank_name: '',
        group: '',
        currency: 'KES',
        is_favorite: false,
      });
      loadBeneficiaries();
    } catch {
      toast.error('Failed to add beneficiary');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this beneficiary?')) return;
    try {
      await deleteBeneficiary(id);
      toast.success('Beneficiary deleted');
      loadBeneficiaries();
    } catch {
      toast.error('Failed to delete beneficiary');
    }
  };

  const handleToggleFavorite = async (id) => {
    try {
      await toggleFavorite(id);
      loadBeneficiaries();
    } catch {
      toast.error('Failed to update favorite');
    }
  };

  const toggleMobileCard = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <h2 className="text-2xl font-semibold text-textDark dark:text-white">Manage Beneficiaries</h2>

      {/* Add Form */}
      <div className="bg-cardBg dark:bg-gray-800 p-6 rounded-3xl shadow-xl-strong">
        <h3 className="text-lg font-semibold mb-4 text-textDark dark:text-white">Add Beneficiary</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            ['name', 'Full Name'],
            ['email', 'Email (optional)'],
            ['phone_number', 'Phone Number'],
            ['bank_account_number', 'Account Number'],
            ['bank_name', 'Bank Name'],
            ['group', 'Group (e.g. Family)'],
          ].map(([key, label]) => (
            <input
              key={key}
              value={form[key]}
              onChange={e => setForm({ ...form, [key]: e.target.value })}
              placeholder={label}
              className="input-field"
            />
          ))}
          <select
            value={form.currency}
            onChange={e => setForm({ ...form, currency: e.target.value })}
            className="input-field"
          >
            <option value="KES">KES</option>
            <option value="USD">USD</option>
          </select>
          <label className="flex items-center gap-2 col-span-3 text-sm text-textGray dark:text-gray-300">
            <input
              type="checkbox"
              checked={form.is_favorite}
              onChange={e => setForm({ ...form, is_favorite: e.target.checked })}
            />
            Mark as Favorite
          </label>
        </div>
        <button
          onClick={handleAdd}
          className="mt-4 bg-primary text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition"
        >
          Add Beneficiary
        </button>
      </div>

      {/* Beneficiaries List */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-textGray">Loading...</p>
        ) : beneficiaries.length === 0 ? (
          <p className="text-textGray">No beneficiaries added yet.</p>
        ) : (
          beneficiaries.map(b => {
            const isOpen = openId === b.id;
            return (
              <div
                key={b.id}
                className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                {/* Header */}
                <div className="w-full md:w-auto flex justify-between md:justify-start md:gap-6 items-center">
                  <div>
                    <p className="font-semibold text-lg text-textDark dark:text-white">
                      {b.name} {b.is_favorite && <span className="text-yellow-400">★</span>}
                    </p>
                    <p className="text-sm text-textGray dark:text-gray-300">
                      Phone: {b.phone_number}
                    </p>
                  </div>

                  {/* Mobile toggle button */}
                  <button
                    onClick={() => toggleMobileCard(b.id)}
                    className="md:hidden text-textGray hover:text-primary transition"
                  >
                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>

                {/* Expanded Content (hidden on mobile unless open) */}
                <div
                  className={`w-full md:flex md:justify-between md:items-center mt-2 md:mt-0 space-y-2 md:space-y-0 ${
                    isOpen ? 'block' : 'hidden'
                  } md:block`}
                >
                  <div className="text-sm text-textGray dark:text-gray-300 space-y-1">
                    <p>
                      Account: {b.bank_account_number || 'N/A'} | Bank: {b.bank_name || 'N/A'}
                    </p>
                    <p>
                      Group: {b.group || 'N/A'} | Currency: {b.currency}
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2 md:pt-0">
                    <button
                      onClick={() => handleToggleFavorite(b.id)}
                      title="Toggle Favorite"
                      className="text-yellow-500 text-lg hover:scale-110 transition"
                    >
                      ★
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      title="Delete"
                      className="text-red-500 hover:text-red-600 transition"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
