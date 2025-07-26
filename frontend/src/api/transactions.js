import axios from '../utils/axiosInstance';

export const fetchTransactions = () =>
  axios.get('history/my-transactions');

export const downloadTransactions = (format = 'csv') =>
  axios.get(`history/my-transactions/download?format=${format}`, {
    responseType: 'blob',
  });
