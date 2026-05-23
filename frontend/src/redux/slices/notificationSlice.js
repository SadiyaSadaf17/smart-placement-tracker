import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/notifications');
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load notifications');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/notifications/${id}`);
      return { id, responseData: data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete notification');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    unreadCount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
      if (!action.payload.isRead) state.unreadCount += 1;
    },
    markRead: (state, action) => {
      const n = state.items.find((i) => i._id === action.payload);
      if (n && !n.isRead) {
        n.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data || [];
        state.unreadCount = action.payload.unreadCount || 0;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.items = [];
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const { id, responseData } = action.payload;
        state.items = state.items.filter((i) => i._id !== id);
        state.unreadCount = responseData.unreadCount !== undefined ? responseData.unreadCount : state.unreadCount;
      });
  },
});

export const { addNotification, markRead } = notificationSlice.actions;
export default notificationSlice.reducer;
