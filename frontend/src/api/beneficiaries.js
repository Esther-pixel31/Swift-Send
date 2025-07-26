import axios from '../utils/axiosInstance';

export const getBeneficiaries = () => axios.get('/beneficiaries');
export const deleteBeneficiary = (id) => axios.delete(`/beneficiaries/${id}`);
export const toggleFavorite = (id) => axios.patch(`/beneficiaries/${id}/favorite`);

export const addBeneficiary = (data) =>
  axios.post('/beneficiaries', {
    name: data.name,
    email: data.email || '', // fallback
    phone_number: data.phone_number || '',
    bank_account_number: data.bank_account_number || '',
    bank_name: data.bank_name || '',
    group: data.group || '',
    is_favorite: data.is_favorite || false,
  });