export default function EditWalletModal({ wallet, editData, setEditData, onClose, onSave }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl space-y-4 w-full max-w-md">
        <h3 className="text-lg font-semibold">Edit Wallet - {wallet.user_email}</h3>
        <input
        type="number"
        value={editData.balance}
        onChange={(e) => setEditData({ ...editData, balance: e.target.value })}
        className="w-full border px-3 py-2 rounded mb-3"
        />

        <label className="block text-sm font-medium mb-1">Daily Limit</label>
        <input
        type="number"
        value={editData.daily_limit}
        onChange={(e) => setEditData({ ...editData, daily_limit: e.target.value })}
        className="w-full border px-3 py-2 rounded mb-3"
        />

        <label className="block text-sm font-medium mb-1">Monthly Limit</label>
        <input
        type="number"
        value={editData.monthly_limit}
        onChange={(e) => setEditData({ ...editData, monthly_limit: e.target.value })}
        className="w-full border px-3 py-2 rounded mb-3"
        />

        <label className="block text-sm font-medium mb-1">Budget</label>
        <input
        type="number"
        value={editData.budget}
        onChange={(e) => setEditData({ ...editData, budget: e.target.value })}
        className="w-full border px-3 py-2 rounded mb-3"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
