// store/bookingsSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// Thunk: fetch all bookings
export const fetchBookings = createAsyncThunk(
  "bookings/fetchBookings",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/bookings", {
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        return rejectWithValue(error.message || "Không thể tải danh sách đặt phòng");
      }
      const data = await res.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Lỗi kết nối server");
    }
  }
);

// Thunk: create new booking
export const createBooking = createAsyncThunk(
  "bookings/createBooking",
  async (bookingData, { rejectWithValue }) => {
    try {
      console.log("Creating booking with data:", bookingData);
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(bookingData),
      });
      
      const responseData = await res.json();
      console.log("Booking response:", { status: res.status, data: responseData });
      
      if (!res.ok) {
        const errorMessage = responseData.message || responseData.error || "Không thể đặt phòng";
        console.error("Booking error:", errorMessage);
        return rejectWithValue(errorMessage);
      }
      return responseData;
    } catch (error) {
      console.error("Booking network error:", error);
      return rejectWithValue(error.message || "Lỗi kết nối server");
    }
  }
);

// Thunk: update booking status
export const updateBookingStatus = createAsyncThunk(
  "bookings/updateBookingStatus",
  async ({ bookingId, status, cancellation_reason, cancellation_type }, { rejectWithValue }) => {
    try {
      console.log("Updating booking:", { bookingId, status, cancellation_reason, cancellation_type });
      
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status, cancellation_reason, cancellation_type }),
      });
      
      let responseData;
      try {
        responseData = await res.json();
      } catch (jsonError) {
        console.error("Failed to parse JSON response:", jsonError);
        const text = await res.text();
        console.error("Response text:", text);
        return rejectWithValue("Lỗi phản hồi từ server");
      }
      
      if (!res.ok) {
        console.error("API Error Response:", {
          status: res.status,
          statusText: res.statusText,
          data: responseData
        });
        
        // Log chi tiết responseData để debug
        console.error("Full error response:", JSON.stringify(responseData, null, 2));
        
        // Hiển thị chi tiết lỗi từ server
        let errorMessage = "Lỗi server";
        if (responseData) {
          if (responseData.message) {
            errorMessage = responseData.message;
          } else if (responseData.error) {
            errorMessage = responseData.error;
          } else if (typeof responseData === 'string') {
            errorMessage = responseData;
          }
          
          // Thêm chi tiết lỗi nếu có (trong development)
          if (process.env.NODE_ENV === 'development' && responseData.details) {
            console.error("Error details:", responseData.details);
          }
        }
        
        return rejectWithValue(errorMessage || `Lỗi server (${res.status}): ${res.statusText}`);
      }
      
      console.log("Booking cancelled successfully:", responseData);
      return responseData;
    } catch (error) {
      console.error("Network Error Details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      return rejectWithValue(error.message || "Lỗi kết nối server");
    }
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
        state.error = action.payload || action.error.message;
      })
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        // Thêm booking mới vào đầu danh sách nếu có thông tin
        if (action.payload && action.payload.result) {
          // Có thể fetch lại toàn bộ sau khi tạo thành công
        }
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(updateBookingStatus.pending, (state) => {
        // Không set loading = true để tránh làm toàn bộ danh sách hiển thị loading
        state.error = null;
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        state.error = null;
        // Cập nhật status trong list ngay lập tức
        // Server trả về: { booking_id, new_status, cancellation_reason }
        const bookingId = action.payload.booking_id || action.payload.id;
        const bookingIndex = state.list.findIndex((b) => b.id === bookingId || b.id === parseInt(bookingId));
        
        if (bookingIndex !== -1) {
          // Cập nhật status, cancellation_reason và cancellation_type ngay lập tức
          state.list[bookingIndex].status = action.payload.new_status || action.payload.status;
          if (action.payload.cancellation_reason !== undefined) {
            state.list[bookingIndex].cancellation_reason = action.payload.cancellation_reason;
          }
          if (action.payload.cancellation_type !== undefined) {
            state.list[bookingIndex].cancellation_type = action.payload.cancellation_type;
          }
        }
      })
      .addCase(updateBookingStatus.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      });
  },
});

export default bookingsSlice.reducer;
