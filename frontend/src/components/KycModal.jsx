import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import axios from '../utils/axiosInstance';
import { toast } from 'react-toastify';

export default function KycModal({ isOpen, onClose, onUploadSuccess }) {
  const [docType, setDocType] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [file, setFile] = useState(null);
  const [useFileUpload, setUseFileUpload] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateUrl = (url) => {
  // Accept normal URLs and Google Drive URLs
  const fileExtRegex = /\.(pdf|jpg|jpeg|png)$/i;
  const isGoogleDrive = /drive\.google\.com/.test(url);
  return fileExtRegex.test(url) || isGoogleDrive;
};


  const convertGoogleDriveLink = (link) => {
    const match = link.match(/\/d\/([^/]+)\//);
    if (match) {
      return `https://drive.google.com/uc?export=download&id=${match[1]}`;
    }
    return link;
  };

  const handleSubmit = async () => {
    if (!docType) {
      toast.error('Please select a document type');
      return;
    }

    setLoading(true);
    try {
      if (useFileUpload && file) {
        const formData = new FormData();
        formData.append('document_type', docType);
        formData.append('document_number', 'N/A'); // Update if needed
        formData.append('document', file);

        await axios.post('/kyc/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        const formattedUrl = convertGoogleDriveLink(docUrl);

        if (!docUrl || !validateUrl(formattedUrl)) {
          toast.error('Please enter a valid document URL (PDF, JPG, PNG)');
          setLoading(false);
          return;
        }

        await axios.post('/kyc/upload-from-url', {
          document_type: docType,
          document_number: 'N/A', // Update if needed
          document_url: formattedUrl,
        });
      }

      toast.success('KYC submitted!');
      setDocType('');
      setDocUrl('');
      setFile(null);
      setUseFileUpload(false);
      onUploadSuccess?.();
      onClose();
    } catch (err) {
      toast.error(
        err?.response?.data?.msg || 'Failed to submit KYC'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment}>
          <div className="fixed inset-0 bg-black bg-opacity-30" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child as={Fragment}>
            <Dialog.Panel className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <Dialog.Title className="text-lg font-medium mb-4">
                Upload KYC Document
              </Dialog.Title>

              <div className="space-y-4">
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="">Select Document Type</option>
                  <option value="passport">Passport</option>
                  <option value="id_card">ID Card</option>
                  <option value="driver_license">Driver’s License</option>
                </select>

                <div className="text-sm flex items-center gap-2">
                  <label>
                    <input
                      type="checkbox"
                      checked={useFileUpload}
                      onChange={(e) => setUseFileUpload(e.target.checked)}
                    />{' '}
                    Use file upload instead of URL
                  </label>
                </div>

                {useFileUpload ? (
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="w-full border px-3 py-2 rounded"
                  />
                ) : (
                  <input
                    type="url"
                    placeholder="Paste document/image URL here"
                    value={docUrl}
                    onChange={(e) => setDocUrl(e.target.value)}
                    className="w-full border px-3 py-2 rounded"
                  />
                )}

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
