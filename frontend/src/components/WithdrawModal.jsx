import { useState } from 'react';
import axios from '../utils/axiosInstance';
import { toast } from 'react-toastify';

export default function WithdrawModal({ onClose, fetchWallet }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleWithdraw = async () => {
    const numericAmount = parseFloat(amount);

    if (!numericAmount || numericAmount <= 0) {
      toast.error('Enter a valid withdrawal amount.');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/wallet/withdraw', { amount: numericAmount });
      toast.success('Withdrawal successful');
      fetchWallet(); // Refresh wallet balance
      onClose();
    } catch (error) {
      toast.error('Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white p-6 rounded-xl w-96 space-y-4 shadow-lg animate-fade-in">
        <h3 className="text-xl font-semibold text-gray-800">Withdraw Funds</h3>

        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          autoFocus
          className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
        />

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleWithdraw}
            disabled={loading}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm disabled:opacity-50"
          >
            {loading ? 'Withdrawing...' : 'Withdraw'}
          </button>
        </div>
      </div>
    </div>
  );
}
