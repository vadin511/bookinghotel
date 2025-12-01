import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      let res = await fetch('/api/profile', {
        credentials: "include",
      });
      let data = await res.json();
      
      // Nếu token hết hạn (401), thử refresh token
      if (res.status === 401) {
        try {
          const refreshRes = await fetch("/api/refresh", {
            method: "POST",
            credentials: "include",
          });
          
          if (refreshRes.ok) {
            // Refresh thành công, thử lại fetch profile
            res = await fetch('/api/profile', {
              credentials: "include",
            });
            data = await res.json();
          } else {
            // Refresh token cũng hết hạn
            throw new Error("Phiên đăng nhập đã hết hạn");
          }
        } catch (refreshErr) {
          return rejectWithValue("Phiên đăng nhập đã hết hạn");
        }
      }
      
      if (!res.ok) {
        // Nếu tài khoản bị blocked, trả về thông báo đặc biệt
        if (res.status === 403 && data.blocked) {
          return rejectWithValue({
            message: data.message || "Tài khoản của bạn đã bị vô hiệu hóa, vui lòng liên hệ với tổng đài VadiGo để được sử dụng",
            blocked: true
          });
        }
        throw new Error(data.message || 'Failed to fetch user profile');
      }
      return data.user;
    } catch (error) {
      return rejectWithValue(error.message || 'Lỗi không xác định');
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

export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(profileData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Không thể cập nhật thông tin");
      }

      const data = await res.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Lỗi kết nối server");
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

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.message || 'Đăng nhập thất bại');
      }

      if (!data.access) {
        return rejectWithValue(data.message || 'Đăng nhập thất bại');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Lỗi không xác định');
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
    resetLoginStatus: (state) => {
      state.loginStatus = 'idle';
      state.loginError = null;
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
      })
      
      // Update user profile
      .addCase(updateUserProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload.user;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { setUser, clearUser, resetLoginStatus } = userSlice.actions;

// Selectors
export const selectUser = (state) => state.user.data;
export const selectUserStatus = (state) => state.user.status;
export const selectLoginStatus = (state) => state.user.loginStatus;
export const selectLogoutStatus = (state) => state.user.logoutStatus;

export default userSlice.reducer;