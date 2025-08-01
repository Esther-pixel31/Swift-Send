import { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";

export function KycStatus() {
  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchKyc() {
      try {
        const res = await axios.get("/kyc/status");
        setKyc(res.data);
      } catch (err) {
        console.error("Failed to fetch KYC status:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchKyc();
  }, []);

  if (loading) return <p className="text-sm text-gray-500">Loading KYC details...</p>;
  if (!kyc) return <p className="text-sm text-gray-500">No KYC record found.</p>;

  return (
    <div className="space-y-2 text-sm mt-2">
      <p><strong>Type:</strong> {kyc.document_type}</p>
      <p><strong>Number:</strong> {kyc.document_number}</p>
      <p><strong>Status:</strong> {capitalize(kyc.status)}</p>
      {kyc.status === "rejected" && (
        <p className="text-red-600"><strong>Rejection Reason:</strong> {kyc.rejection_reason}</p>
      )}
      {kyc.file_url && (
        <p>
          <a
            href={kyc.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            View Document
          </a>
        </p>
      )}
    </div>
  );
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}
