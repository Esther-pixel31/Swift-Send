import axios from '../utils/axiosInstance';

export const fetchAdminMetrics = () => axios.get('/admin/dashboard/metrics');
export const fetchAllUsers = () => axios.get('/admin/users');
export const updateUser = (id, data) => axios.put(`/admin/users/${id}`, data);
export const deleteUser = (id) => axios.delete(`/admin/users/${id}`);
