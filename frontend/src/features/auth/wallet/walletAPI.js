import axios from '../../utils/axiosInstance';

export const fetchWallet = async () => {
  const response = await axios.get('/wallet');  // NOT /wallets/me unless you add that route
  return response.data;
};
