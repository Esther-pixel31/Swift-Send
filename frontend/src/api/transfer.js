import axios from '../utils/axiosInstance';

export const sendDomesticTransfer = (data) => axios.post('/transfer/domestic', data);
