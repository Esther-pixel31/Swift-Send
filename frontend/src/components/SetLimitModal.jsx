import React, { useState } from "react";
import axios from "../utils/axiosInstance";
import { toast } from "react-toastify";

const SetLimitModal = ({ isOpen, onClose, onSuccess, currentLimits }) => {
  const [depositLimit, setDepositLimit] = useState(currentLimits?.deposit_limit || 0);
  const [withdrawLimit, setWithdrawLimit] = useState(currentLimits?.withdraw_limit || 0);
  const [loading, setLoading] = useState(false);

  const handleUpdateLimits = async () => {
    const deposit = parseFloat(depositLimit);
    const withdraw = parseFloat(withdrawLimit);

    if (isNaN(deposit) || deposit < 0 || isNaN(withdraw) || withdraw < 0) {
      toast.error("Please enter valid non-negative limits.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/wallet/update-limits", {
        deposit_limit: deposit,
        withdraw_limit: withdraw,
      });

      toast.success("Wallet limits updated successfully!");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to update limits:", error);
      toast.error("Failed to update wallet limits.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md space-y-4 animate-fade-in">
        <h2 className="text-xl font-semibold text-gray-800">Set Wallet Limits</h2>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Deposit Limit</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={depositLimit}
            onChange={(e) => setDepositLimit(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter deposit limit"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Withdrawal Limit</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={withdrawLimit}
            onChange={(e) => setWithdrawLimit(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter withdrawal limit"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateLimits}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetLimitModal;
