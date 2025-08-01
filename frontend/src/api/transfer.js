import axios from '../utils/axiosInstance';

export const sendDomesticTransfer = (data) => axios.post('/transfer/domestic', data);
export const sendInternationalTransfer = (data) => {
  console.log("Sending international transfer:", data); // ✅ Add this
  return axios.post('/transfer/international', data);
};
export const getScheduledTransfers = () => axios.get('/transfer/scheduled');
export const cancelScheduledTransfer = (id) => axios.delete(`/transfer/scheduled/${id}`);
export const scheduleTransfer = async (data) => {
  const res = await axios.post('/transfer/schedule', data);
  return res.data;
};
export const requestMoney = async (data) => {
  const res = await axios.post('/transfer/request-money', data);
  return res.data;
};
export const getReceivedRequests = () => axios.get('/transfer/received-requests');

export const fulfillPaymentRequest = (id) =>
  axios.post(`/transfer/fulfill-request/${id}`);

export const declinePaymentRequest = (id) =>
  axios.post(`/transfer/decline-request/${id}`);