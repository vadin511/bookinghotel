import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch('/api/profile');
      if (!res.ok) {
        throw new Error('Failed to fetch user profile');
      }
      const data = await res.json();
      return data.user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'user/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/logout", {
        method: "POST",
      });
      
      if (!res.ok) {
        throw new Error('Failed to logout');
      }
      
      const data = await res.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loginUser = createAsyncThunk(
  'user/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });
      
      if (!res.ok) {
        throw new Error('Failed to login');
      }
      
      const data = await res.json();
      if (!data.access) {
        return rejectWithValue(data.message);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    data: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    loginStatus: 'idle',
    loginError: null,
    logoutStatus: 'idle',
    logoutError: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.data = action.payload;
    },
    clearUser: (state) => {
      state.data = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Login user
      .addCase(loginUser.pending, (state) => {
        state.loginStatus = 'loading';
      })
      .addCase(loginUser.fulfilled, (state) => {
        state.loginStatus = 'succeeded';
        // We'll fetch the user profile after successful login
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginStatus = 'failed';
        state.loginError = action.payload;
      })
      
      // Logout user
      .addCase(logoutUser.pending, (state) => {
        state.logoutStatus = 'loading';
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.logoutStatus = 'succeeded';
        state.data = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.logoutStatus = 'failed';  
        state.logoutError = action.payload;
      });
  },
});

export const { setUser, clearUser } = userSlice.actions;

// Selectors
export const selectUser = (state) => state.user.data;
export const selectUserStatus = (state) => state.user.status;
export const selectLoginStatus = (state) => state.user.loginStatus;
export const selectLogoutStatus = (state) => state.user.logoutStatus;

export default userSlice.reducer;