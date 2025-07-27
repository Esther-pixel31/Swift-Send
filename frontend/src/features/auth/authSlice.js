import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axiosInstance';
import { jwtDecode } from 'jwt-decode';

// LOGIN
export const login = createAsyncThunk('auth/login', async (payload, thunkAPI) => {
  try {
    const res = await axios.post('/auth/login', payload);

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
    return { msg: res.data.msg || 'Registration successful' };
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
      state.status = 'idle';
      state.error = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    setAuthFromStorage(state, action) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      try {
        state.user = jwtDecode(action.payload.accessToken);
      } catch {
        state.user = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.accessToken = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        try {
          state.user = jwtDecode(action.payload.access_token);
        } catch {
          state.user = null;
        }
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = {
          type: 'login',
          message: action.payload?.msg || 'Login failed'
        };
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = {
          type: 'register',
          message: action.payload?.msg || 'Registration failed'
        };
      });
  },
});

export const { logout, setAuthFromStorage } = authSlice.actions;
export default authSlice.reducer;
