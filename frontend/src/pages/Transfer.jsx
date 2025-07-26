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

  const loadBeneficiaries = async () => {
    try {
      const res = await getBeneficiaries();
      setBeneficiaries(res.data);
    } catch {
      toast.error('Failed to load beneficiaries');
    }
  };

  useEffect(() => {
    loadBeneficiaries();
  }, []);

  const handleSend = async () => {
    if (!form.receiver_email || !form.amount) {
      return toast.warn('Recipient and amount are required');
    }
    try {
      await sendDomesticTransfer(form);
      toast.success('Transfer successful');
      setForm({ receiver_email: '', amount: '', note: '', currency: 'KES' });
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Transfer failed');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Send Money</h2>

      <div className="grid md:grid-cols-2 gap-4">
        <select value={form.receiver_email} onChange={e => setForm({ ...form, receiver_email: e.target.value })} className="input">
          <option value="">Select Beneficiary</option>
          {beneficiaries.map(b => (
            <option key={b.id} value={b.email}>{b.name} ({b.currency})</option>
          ))}
        </select>

        <input type="number" placeholder="Amount" className="input"
          value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
        
        <input type="text" placeholder="Note (optional)" className="input"
          value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
        
        <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} className="input">
          <option value="KES">KES</option>
          <option value="USD">USD</option>
        </select>
      </div>

      <button onClick={handleSend} className="btn mt-2">Send</button>
    </div>
  );
}
