import { useEffect, useState } from 'react';
import {
  getBeneficiaries,
  addBeneficiary,
  deleteBeneficiary,
  toggleFavorite,
} from '../api/beneficiaries';
import { toast } from 'react-toastify';

export default function Beneficiaries() {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [form, setForm] = useState({
    name: '',
    phone_number: '',
    bank_account_number: '',
    bank_name: '',
    group: '',
    currency: 'KES',
    is_favorite: false,
  });
  const [loading, setLoading] = useState(false);

  const loadBeneficiaries = async () => {
    setLoading(true);
    try {
      const res = await getBeneficiaries();
      setBeneficiaries(res.data);
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
        is_favorite: false,
      });
      loadBeneficiaries();
    } catch {
      toast.error('Failed to add beneficiary');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">My Beneficiaries</h2>

      <div className="grid md:grid-cols-3 gap-4">
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name" className="input" />
        <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email (optional)" className="input" />
        <input value={form.phone_number} onChange={e => setForm({ ...form, phone_number: e.target.value })} placeholder="Phone Number" className="input" />
        <input value={form.bank_account_number} onChange={e => setForm({ ...form, bank_account_number: e.target.value })} placeholder="Bank Account" className="input" />
        <input value={form.bank_name} onChange={e => setForm({ ...form, bank_name: e.target.value })} placeholder="Bank Name" className="input" />
        <input value={form.group} onChange={e => setForm({ ...form, group: e.target.value })} placeholder="Group (e.g. family)" className="input" />
        <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} className="input">
          <option value="KES">KES</option>
          <option value="USD">USD</option>
        </select>
        <label className="flex items-center gap-2 col-span-3">
          <input type="checkbox" checked={form.is_favorite} onChange={e => setForm({ ...form, is_favorite: e.target.checked })} />
          Mark as Favorite
        </label>
      </div>

      <button onClick={handleAdd} className="btn">Add Beneficiary</button>

      <div className="grid gap-3 mt-6">
        {loading ? (
          <p>Loading...</p>
        ) : beneficiaries.length === 0 ? (
          <p>No beneficiaries added.</p>
        ) : (
          beneficiaries.map(b => (
            <div key={b.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
              <div>
                <p className="font-medium">{b.name} {b.is_favorite && '★'}</p>
                <p className="text-sm text-gray-600">Phone: {b.phone_number}</p>
                <p className="text-sm text-gray-500">Account: {b.bank_account_number || 'N/A'} | Bank: {b.bank_name || 'N/A'} | Group: {b.group || 'N/A'}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleFavorite(b.id)} className="text-yellow-500">★</button>
                <button onClick={() => deleteBeneficiary(b.id)} className="text-red-500">🗑</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
