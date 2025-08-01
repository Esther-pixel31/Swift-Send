import axios from '../utils/axiosInstance';

export const sendDomesticTransfer = (data) => axios.post('/transfer/domestic', data);
export const sendInternationalTransfer = (data) => axios.post('/transfer/international', data);
export const getScheduledTransfers = () => axios.get('/transfer/scheduled');
export const cancelScheduledTransfer = (id) => axios.delete(`/transfer/scheduled/${id}`);
export const scheduleTransfer = async (data) => {
  const res = await fetch('/api/transfer/schedule', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.msg || 'Failed to schedule transfer');
  }
  return res.json();
};
