import { useEffect, useState } from 'react';
import { getBeneficiaries } from '../api/beneficiaries';
import { sendDomesticTransfer } from '../api/transfer';
import { toast } from 'react-toastify';

export default function Transfer() {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [form, setForm] = useState({
    receiver_email: '',
    amount: '',
    note: '',
    currency: 'KES'
  });
  const [loading, setLoading] = useState(false);

  const loadBeneficiaries = async () => {
    try {
      const res = await getBeneficiaries();
      setBeneficiaries(res.data || []);
    } catch {
      toast.error('Failed to load beneficiaries');
    }
  };

  useEffect(() => {
    loadBeneficiaries();
  }, []);

  const handleSend = async () => {
    if (!form.receiver_email || !form.amount) {
      return toast.warn('Please select a recipient and enter an amount.');
    }

    const confirmed = window.confirm(`Send ${form.amount} ${form.currency} to ${form.receiver_email}?`);
    if (!confirmed) return;

    setLoading(true);
    try {
      await sendDomesticTransfer(form);
      toast.success('Transfer successful');
      setForm({ receiver_email: '', amount: '', note: '', currency: 'KES' });
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800">💸 Send Money</h2>

      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Beneficiary Selector */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">Select Beneficiary</label>
            <select
              value={form.receiver_email}
              onChange={(e) => setForm({ ...form, receiver_email: e.target.value })}
              className="input"
            >
              <option value="">-- Choose Beneficiary --</option>
              {beneficiaries.map((b) => (
                <option key={b.id} value={b.email}>
                  {b.name} ({b.currency})
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">Amount</label>
            <input
              type="number"
              placeholder="e.g. 1000"
              className="input"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </div>

          {/* Note */}
          <div className="md:col-span-2">
            <label className="block mb-1 text-sm font-medium text-gray-600">Note (optional)</label>
            <input
              type="text"
              placeholder="e.g. Rent payment"
              className="input"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </div>

          {/* Currency */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">Currency</label>
            <select
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className="input"
            >
              <option value="KES">KES</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button onClick={handleSend} className="btn" disabled={loading}>
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
