import { useState } from "react";
import axios from "../utils/axiosInstance";
import { toast } from "react-toastify";

export default function UploadKycDocument({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState("passport");
  const [documentNumber, setDocumentNumber] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Only JPG, PNG, or PDF files are allowed.");
      return;
    }

    const maxSizeMB = 5;
    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      toast.error("File size exceeds 5MB.");
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !documentType || !documentNumber.trim()) {
      toast.error("All fields are required.");
      return;
    }

    const formData = new FormData();
    formData.append("document", file);
    formData.append("document_type", documentType);
    formData.append("document_number", documentNumber.trim());

    try {
      setUploading(true);
      await axios.post("/kyc/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Document uploaded successfully.");
      setFile(null);
      setDocumentNumber("");
      setDocumentType("passport");
      onUploadSuccess?.();
    } catch (err) {
      console.error("KYC upload failed:", err?.response || err);
      toast.error("Failed to upload document.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-50 border border-gray-200 p-5 rounded-xl space-y-4 mt-6"
    >
      <h3 className="font-semibold text-lg text-gray-800">Upload KYC Document</h3>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Document File</label>
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={handleFileChange}
          className="w-full"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Document Number</label>
        <input
          type="text"
          placeholder="e.g. A1234567"
          className="w-full border px-3 py-2 rounded"
          value={documentNumber}
          onChange={(e) => setDocumentNumber(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Document Type</label>
        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="passport">Passport</option>
          <option value="national_id">National ID</option>
          <option value="driver_license">Driver's License</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={uploading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload Document"}
      </button>
    </form>
  );
}
