/* eslint-disable @typescript-eslint/no-unused-vars */
// features/bannerSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// --- Fetch all banners
export const fetchBanners = createAsyncThunk("banners/fetchBanners", async (includeInactive = false) => {
  const res = await axios.get(`/api/banners?includeInactive=${includeInactive}`);
  return res.data;
});

// --- Add banner
export const addBanner = createAsyncThunk("banners/addBanner", async (bannerData) => {
  const res = await axios.post("/api/banners", bannerData);
  return res.data.result || res.data;
});

// --- Update banner
export const updateBanner = createAsyncThunk("banners/updateBanner", async ({ id, data }) => {
  const res = await axios.put(`/api/banners/${id}`, data);
  return { id, ...res.data.result };
});

// --- Delete banner
export const deleteBanner = createAsyncThunk("banners/deleteBanner", async (id) => {
  await axios.delete(`/api/banners/${id}`);
  return id;
});

const bannerSlice = createSlice({
  name: "banners",
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {
    resetBanners: (state) => {
      state.data = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch
      .addCase(fetchBanners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBanners.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // --- Add
      .addCase(addBanner.fulfilled, (state, action) => {
        state.data.push(action.payload);
      })

      // --- Update
      .addCase(updateBanner.fulfilled, (state, action) => {
        const index = state.data.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = { ...state.data[index], ...action.payload };
        }
      })

      // --- Delete
      .addCase(deleteBanner.fulfilled, (state, action) => {
        state.data = state.data.filter((b) => b.id !== action.payload);
      });
  },
});

// --- Actions thường
export const { resetBanners } = bannerSlice.actions;

// --- Selectors
export const selectBanners = (state) => state.banners.data;
export const selectBannerStatus = (state) => ({
  loading: state.banners.loading,
  error: state.banners.error,
});
export const selectBannerById = (id) => (state) =>
  state.banners.data.find((b) => b.id === id);

export default bannerSlice.reducer;













