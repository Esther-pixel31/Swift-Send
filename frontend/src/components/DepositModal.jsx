import { useState } from 'react';
import axios from '../utils/axiosInstance';
import { toast } from 'react-toastify';

export default function DepositModal({ onClose, fetchWallet }) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('mpesa');
  const [loading, setLoading] = useState(false);

  const handleDeposit = async () => {
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post('/wallet/mock-deposit', {
        amount: numericAmount,
        method
      });

      toast.success(`Deposit successful via ${method.toUpperCase()}. Ref: ${data.reference}`);
      fetchWallet();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-96 space-y-4 shadow-lg animate-fade-in">
        <h3 className="text-xl font-semibold text-gray-800">Deposit Funds</h3>

        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <select
          value={method}
          onChange={e => setMethod(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="mpesa">M-Pesa</option>
          <option value="card">Card</option>
        </select>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDeposit}
            disabled={loading}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-sm disabled:opacity-50"
          >
            {loading ? 'Depositing...' : 'Deposit'}
          </button>
        </div>
      </div>
    </div>
  );
}
