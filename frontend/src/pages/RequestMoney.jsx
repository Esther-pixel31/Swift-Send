import { useState } from 'react';
import { toast } from 'react-toastify';
import { requestMoney } from '../api/transfer';

export default function RequestMoney() {
  const [form, setForm] = useState({
    email: '',
    amount: '',
    currency: 'KES',
    note: ''
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await requestMoney(form);
      toast.success('Payment request sent!');
      setForm({ email: '', amount: '', currency: 'KES', note: '' });
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">💰 Request Money</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Recipient Email"
          value={form.email}
          onChange={handleChange}
          required
          className="input w-full"
        />
        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={form.amount}
          onChange={handleChange}
          required
          className="input w-full"
        />
        <select
          name="currency"
          value={form.currency}
          onChange={handleChange}
          className="input w-full"
        >
          <option value="KES">KES</option>
          <option value="USD">USD</option>
        </select>
        <textarea
          name="note"
          placeholder="Optional Note"
          value={form.note}
          onChange={handleChange}
          className="input w-full"
        />
        <button
          type="submit"
          className="btn bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Send Request
        </button>
      </form>
    </div>
  );
}
