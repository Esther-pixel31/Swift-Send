import axios from '../utils/axiosInstance';

// USER ENDPOINTS
export const createSupportTicket = (payload) =>
  axios.post('/auth/support', payload);

export const getUserSupportTickets = () =>
  axios.get('/auth/support');

// ADMIN ENDPOINTS
export const getAllSupportTickets = () =>
  axios.get('/admin/support/tickets');

export const respondToSupportTicket = (ticketId, payload) =>
  axios.put(`/admin/support/tickets/${ticketId}`, payload);
