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

// ADMIN LOGIN
export const adminLogin = createAsyncThunk('auth/adminLogin', async (payload, thunkAPI) => {
  try {
    const res = await axios.post('/admin/login', payload);
    localStorage.setItem('accessToken', res.data.access_token);
    localStorage.setItem('refreshToken', res.data.refresh_token);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || { msg: 'Server error' });
  }
});
// GOOGLE LOGIN
// googleLogin thunk
export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async ({ credential }, thunkAPI) => {
    try {
      const res = await axios.post('/auth/google', { credential });

      localStorage.setItem('accessToken', res.data.access_token);
      localStorage.setItem('refreshToken', res.data.refresh_token);

      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || { msg: 'Google login failed' });
    }
  }
);




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
    setTempToken(state, action) {
      state.accessToken = action.payload;
      try {
        state.user = jwtDecode(action.payload);
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

  if (action.payload?.access_token) {
    try {
      state.user = jwtDecode(action.payload.access_token);
    } catch {
      state.user = null;
    }
  } else {
    state.user = null;
  }

  state.error = null;
})
.addCase(login.rejected, (state, action) => {
  state.status = 'failed';
  state.error = {
    type: 'login',
    message: action.payload?.msg || 'Login failed',
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
    message: action.payload?.msg || 'Registration failed',
  };
})
.addCase(adminLogin.pending, (state) => {
  state.status = 'loading';
  state.error = null;
})
.addCase(adminLogin.fulfilled, (state, action) => {
  state.status = 'succeeded';
  state.accessToken = action.payload.access_token;
  state.refreshToken = action.payload.refresh_token;

  if (action.payload?.access_token) {
    try {
      state.user = jwtDecode(action.payload.access_token);
    } catch {
      state.user = null;
    }
  } else {
    state.user = null;
  }

  state.error = null;
})
.addCase(adminLogin.rejected, (state, action) => {
  state.status = 'failed';
  state.error = {
    type: 'adminLogin',
    message: action.payload?.msg || 'Admin login failed',
  };
})
.addCase(googleLogin.pending, (state) => {
  state.status = 'loading';
  state.error = null;
})
.addCase(googleLogin.fulfilled, (state, action) => {
  state.status = 'succeeded';
  state.accessToken = action.payload.access_token;
  state.refreshToken = action.payload.refresh_token;

  if (action.payload?.access_token) {
    try {
      state.user = jwtDecode(action.payload.access_token);
    } catch {
      state.user = null;
    }
  } else {
    state.user = null;
  }

  state.error = null;
})
.addCase(googleLogin.rejected, (state, action) => {
  state.status = 'failed';
  state.error = {
    type: 'googleLogin',
    message: action.payload?.msg || 'Google login failed',
  };
});

  },

});

export const { logout, setAuthFromStorage, setTempToken } = authSlice.actions;
export default authSlice.reducer;
