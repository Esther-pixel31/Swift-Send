
// app/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import userReducer from '../features/auth/user/userSlice';
import { setupAxiosInterceptors } from '../utils/axiosInstance'; 

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
  },
});

setupAxiosInterceptors(store);
