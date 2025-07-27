import { useState } from 'react';
import axios from '../utils/axiosInstance';
import { toast } from 'react-toastify';

export default function WithdrawModal({ onClose, fetchWallet }) {
  const [amount, setAmount] = useState('');

  const handleWithdraw = async () => {
    try {
      await axios.post('/wallet/withdraw', { amount: parseFloat(amount) });
      toast.success('Withdrawal successful');
      fetchWallet(); // Update wallet balance
      onClose();
    } catch (error) {
      toast.error('Withdrawal failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-96 space-y-4">
        <h3 className="text-xl font-semibold">Withdraw Funds</h3>
        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          <button onClick={handleWithdraw} className="px-4 py-2 bg-red-500 text-white rounded">Withdraw</button>
        </div>
      </div>
    </div>
  );
}
