import React from 'react';

export default function FxRateModal({
  isOpen,
  onClose,
  onSave,
  formData,
  setFormData,
  editingFx,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl space-y-4 w-full max-w-md">
        <h3 className="text-lg font-semibold">
          {editingFx ? 'Edit FX Rate' : 'Create FX Rate'}
        </h3>

        {!editingFx && (
          <>
            <label className="block text-sm">Base Currency</label>
            <input
              type="text"
              value={formData.base_currency}
              onChange={(e) =>
                setFormData({ ...formData, base_currency: e.target.value })
              }
              className="w-full border px-3 py-2 rounded"
            />

            <label className="block text-sm">Target Currency</label>
            <input
              type="text"
              value={formData.target_currency}
              onChange={(e) =>
                setFormData({ ...formData, target_currency: e.target.value })
              }
              className="w-full border px-3 py-2 rounded"
            />
          </>
        )}

        <label className="block text-sm">Rate</label>
        <input
          type="number"
          value={formData.rate}
          onChange={(e) =>
            setFormData({ ...formData, rate: e.target.value })
          }
          className="w-full border px-3 py-2 rounded"
        />

        <label className="block text-sm">Fee %</label>
        <input
          type="number"
          value={formData.fee_percent}
          onChange={(e) =>
            setFormData({ ...formData, fee_percent: e.target.value })
          }
          className="w-full border px-3 py-2 rounded"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave();
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
