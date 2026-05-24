import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { clearSession } from '../../services/api';

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', credentials);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('profile', JSON.stringify(data.profile));
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/register', userData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('profile', JSON.stringify(data.profile));
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me');
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('profile', JSON.stringify(data.profile));
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const getStored = () => {
  try {
    return {
      user: JSON.parse(localStorage.getItem('user')),
      profile: JSON.parse(localStorage.getItem('profile')),
      token: localStorage.getItem('token'),
    };
  } catch {
    return { user: null, profile: null, token: null };
  }
};

const stored = getStored();

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: stored.user,
    profile: stored.profile,
    token: stored.token,
    loading: false,
    bootstrapped: !stored.token,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.profile = null;
      state.token = null;
      state.error = null;
      state.bootstrapped = true;
      clearSession();
    },
    updateAuthUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    updateProfileImage: (state, action) => {
      if (state.user) {
        state.user.profileImage = action.payload;
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.bootstrapped = true;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.bootstrapped = true;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
        state.token = action.payload.token;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.loading = false;
        state.bootstrapped = true;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.loading = false;
        state.bootstrapped = true;
        state.user = null;
        state.profile = null;
        state.token = null;
        clearSession();
      });
  },
});

export const { logout, clearError, updateAuthUser, updateProfileImage } = authSlice.actions;
export default authSlice.reducer;
