/* eslint-disable @typescript-eslint/no-unused-vars */
// features/hotelSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// --- Fetch all hotels
export const fetchHotels = createAsyncThunk("hotels/fetchHotels", async () => {
  const res = await axios.get("/api/hotel");
  return res.data;
});

// --- Add hotel
export const addHotel = createAsyncThunk("hotels/addHotel", async (hotelData) => {
  const res = await axios.post("/api/hotel", hotelData);
  return res.data;
});

// --- Update hotel
export const updateHotel = createAsyncThunk("hotels/updateHotel", async ({ id, data }) => {
  const res = await axios.put(`/api/hotel/${id}`, data);
  // Trả về dữ liệu từ server nếu có, nếu không thì merge với data gửi lên
  return res.data && res.data.id ? res.data : { id, ...data, ...res.data };
});

// --- Delete hotel
export const deleteHotel = createAsyncThunk("hotels/deleteHotel", async (id) => {
  await axios.delete(`/api/hotel/${id}`);
  return id;
});

const hotelSlice = createSlice({
  name: "hotel",
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {
    resetHotels: (state) => {
      state.data = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch
      .addCase(fetchHotels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // --- Add
      .addCase(addHotel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addHotel.fulfilled, (state, action) => {
        state.loading = false;
        // Thêm khách sạn mới vào danh sách
        const newHotel = action.payload;
        if (newHotel && newHotel.id) {
          state.data.push(newHotel);
        } else if (action.payload.result) {
          state.data.push(action.payload.result);
        }
      })
      .addCase(addHotel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // --- Update
      .addCase(updateHotel.fulfilled, (state, action) => {
        const index = state.data.findIndex((h) => h.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = { ...state.data[index], ...action.payload };
        }
      })

      // --- Delete
      .addCase(deleteHotel.fulfilled, (state, action) => {
        state.data = state.data.filter((h) => h.id !== action.payload);
      });
  },
});

// --- Actions thường
export const { resetHotels } = hotelSlice.actions;

// --- Selectors
export const selectHotels = (state) => state.hotels.data;
export const selectHotelStatus = (state) => ({
  loading: state.hotels.loading,
  error: state.hotels.error,
});
export const selectHotelById = (id) => (state) =>
  state.hotels.data.find((h) => h.id === id);

export default hotelSlice.reducer;
