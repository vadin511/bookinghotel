// store/bookingsSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// Thunk: fetch all bookings
export const fetchBookings = createAsyncThunk(
  "bookings/fetchBookings",
  async () => {
    const res = await fetch("/api/bookings");
    if (!res.ok) throw new Error("Failed to fetch bookings");
    const data = await res.json();
    return data;
  }
);

// Thunk: create new booking
export const createBooking = createAsyncThunk(
  "bookings/createBooking",
  async (bookingData) => {
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData),
    });
    console.log(1,'1');
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to create booking");
    }
    const data = await res.json();
    return data;
  }
);

const bookingsSlice = createSlice({
  name: "bookings",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state) => {
        state.loading = false;
        // Bạn có thể fetch lại toàn bộ hoặc thêm booking mới vào list:
        // state.list.push(action.payload.result.insertId) // nếu muốn insert ngay
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default bookingsSlice.reducer;
