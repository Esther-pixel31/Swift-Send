import axios from '../utils/axiosInstance';

export const sendDomesticTransfer = (data) => axios.post('/transfer/domestic', data);
export const sendInternationalTransfer = (data) => axios.post('/transfer/international', data);