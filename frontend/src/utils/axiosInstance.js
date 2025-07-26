// utils/axiosInstance.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Setup function to receive store after it's created
export const setupAxiosInterceptors = (store) => {
  instance.interceptors.request.use(config => {
    const token = store.getState().auth.accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
};

export default instance;
