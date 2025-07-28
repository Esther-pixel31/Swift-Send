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
    formData.append("document_number", documentNumber);

    try {
      setUploading(true);
      await axios.post("/kyc/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Document uploaded successfully.");
      onUploadSuccess();
    } catch (err) {
      console.error("Upload error", err);
      toast.error("Failed to upload document.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-50 border p-4 rounded-xl space-y-3 mt-6"
    >
      <h3 className="font-semibold text-lg">Upload KYC Document</h3>

      <input
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        onChange={handleFileChange}
        className="block w-full"
      />

      <input
        type="text"
        placeholder="Document Number"
        className="w-full border px-3 py-2 rounded"
        value={documentNumber}
        onChange={(e) => setDocumentNumber(e.target.value)}
      />

      <select
        value={documentType}
        onChange={(e) => setDocumentType(e.target.value)}
        className="w-full border px-3 py-2 rounded"
      >
        <option value="passport">Passport</option>
        <option value="national_id">National ID</option>
        <option value="driver_license">Driver's License</option>
      </select>

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
