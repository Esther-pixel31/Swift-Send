import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axiosInstance';

// LOGIN
export const login = createAsyncThunk('auth/login', async (payload, thunkAPI) => {
  try {
    const res = await axios.post('/auth/login', payload);

    // Persist tokens
    localStorage.setItem('accessToken', res.data.access_token);
    localStorage.setItem('refreshToken', res.data.refresh_token);

    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || { msg: 'Server error' });
  }
});

// REGISTER
export const register = createAsyncThunk('auth/register', async (payload, thunkAPI) => {
  try {
    const res = await axios.post('/auth/register', payload);
    return { msg: res.data.msg || 'Registration successful' }; // <-- return something
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || { msg: 'Registration failed' });
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    accessToken: null,
    refreshToken: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    setAuthFromStorage(state, action) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.accessToken = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.error = action.payload?.msg;
      })
      .addCase(register.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.error = action.payload?.msg;
      });
  },
});

export const { logout, setAuthFromStorage } = authSlice.actions;
export default authSlice.reducer;
