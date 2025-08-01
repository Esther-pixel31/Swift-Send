import axios from '../utils/axiosInstance';

export const getFXRate = async (baseCurrency, targetCurrency) => {
  const res = await axios.get(`/fx-rate?base=${baseCurrency}&target=${targetCurrency}`);
  return res.data;
};
