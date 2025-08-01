import { useEffect, useState } from 'react';
import { getBeneficiaries } from '../api/beneficiaries';
import { sendDomesticTransfer, sendInternationalTransfer } from '../api/transfer';
import { getFXRate } from '../api/fxRates';
import { toast } from 'react-toastify';

export default function Transfer() {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [form, setForm] = useState({
    receiver_email: '',
    amount: '',
    note: '',
    currency: 'KES',
    scheduled_at: '',
    recurrence: ''
  });

  const [fxRate, setFxRate] = useState(null);
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [fxFee, setFxFee] = useState(null);
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

  useEffect(() => {
    const fetchFX = async () => {
      const beneficiary = beneficiaries.find(b => b.email === form.receiver_email);
      if (!beneficiary || beneficiary.currency === form.currency || !form.amount) {
        setFxRate(null);
        setConvertedAmount(null);
        setFxFee(null);
        return;
      }

      try {
        const data = await getFXRate(form.currency, beneficiary.currency);
        setFxRate(data);

        const amount = parseFloat(form.amount);
        const fee = amount * (data.fee_percent / 100);
        const converted = amount * data.rate;

        setFxFee(fee.toFixed(2));
        setConvertedAmount(converted.toFixed(2));
      } catch {
        setFxRate(null);
        setConvertedAmount(null);
        setFxFee(null);
        toast.error('Failed to fetch FX rate');
      }
    };

    fetchFX();
  }, [form.receiver_email, form.amount, form.currency, beneficiaries]);

  const handleSend = async () => {
    if (!form.receiver_email || !form.amount) {
      return toast.warn('Please select a recipient and enter an amount.');
    }

    const recipient = beneficiaries.find(b => b.email === form.receiver_email);
    if (!recipient) return toast.error('Recipient not found');

    const isInternational = recipient.currency !== form.currency;

    const confirmMessage = isInternational
      ? `Send ${form.amount} ${form.currency} to ${form.receiver_email}?\nRecipient will get ≈ ${convertedAmount} ${recipient.currency} (fee: ${fxFee} ${form.currency})`
      : `Send ${form.amount} ${form.currency} to ${form.receiver_email}?`;

    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) return;

    setLoading(true);
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null,
        beneficiary_id: recipient.id,
      };

      if (isInternational) {
        const fx = await getFXRate(form.currency, recipient.currency);
        if (!fx || !fx.rate) throw new Error('FX rate missing');

        const res = await sendInternationalTransfer(payload);

        toast.success(
          form.scheduled_at
            ? 'Scheduled international transfer created'
            : `Sent ${form.amount} ${form.currency} → ${res.data.converted_amount} ${recipient.currency} @ rate ${res.data.fx_rate}`
        );
      } else {
        await sendDomesticTransfer(payload);
        toast.success(form.scheduled_at ? 'Scheduled transfer created' : 'Transfer successful');
      }

      setForm({
        receiver_email: '',
        amount: '',
        note: '',
        currency: 'KES',
        scheduled_at: '',
        recurrence: ''
      });
      setFxRate(null);
      setConvertedAmount(null);
      setFxFee(null);
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

          {/* Scheduled Date */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">Schedule Date</label>
            <input
              type="datetime-local"
              className="input"
              value={form.scheduled_at}
              onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
            />
          </div>

          {/* Recurrence */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">Recurrence</label>
            <select
              className="input"
              value={form.recurrence}
              onChange={(e) => setForm({ ...form, recurrence: e.target.value })}
            >
              <option value="">One-time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        {/* FX Preview */}
        {fxRate && (
          <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded mt-2">
            💱 <strong>FX Rate:</strong> 1 {fxRate.base_currency} = {fxRate.rate} {fxRate.target_currency}<br />
            💸 <strong>Fee:</strong> {fxRate.fee_percent}% → {fxFee} {fxRate.base_currency}<br />
            📤 <strong>Recipient gets:</strong> ≈ {convertedAmount} {fxRate.target_currency}
          </div>
        )}

        {/* Submit */}
        <div className="pt-2">
          <button onClick={handleSend} className="btn" disabled={loading}>
            {loading ? 'Sending...' : form.scheduled_at ? 'Schedule Transfer' : 'Send Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
