import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// Lấy thông tin chi tiết 1 phòng
export const fetchRoomById = createAsyncThunk(
  "rooms/fetchRoomById",
  async (id, thunkAPI) => {
    try {
      if (!id) {
        return thunkAPI.rejectWithValue("Thiếu ID phòng");
      }
      const res = await axios.get(`http://localhost:3000/api/room/${id}`);
      return res.data;
      
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Không thể tải chi tiết phòng"
      );
    }
  }
);

// Fetch danh sách phòng
export const fetchRooms = createAsyncThunk(
  "rooms/fetchRooms",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get("http://localhost:3000/api/room");
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Không thể tải danh sách phòng"
      );
    }
  }
);
// lấy danh sách phòng theo khách sạn
export const fetchRoomsByHotelId = createAsyncThunk(
  "rooms/fetchRoomsByHotelId",
  async (id, thunkAPI) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/hotels/${id}/rooms`
      );
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Không thể tải phòng theo khách sạn"
      );
    }
  }
);

// Thêm phòng
export const addRoom = createAsyncThunk(
  "rooms/addRoom",
  async (roomData, thunkAPI) => {
    try {
      const res = await axios.post("http://localhost:3000/api/room", roomData);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Lỗi khi thêm phòng"
      );
    }
  }
);

// Cập nhật phòng
export const updateRoom = createAsyncThunk(
  "rooms/updateRoom",
  async (roomData, thunkAPI) => {
    try {
      const res = await axios.put(
        `http://localhost:3000/api/room/${roomData.id}`,
        roomData
      );
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Lỗi khi cập nhật phòng"
      );
    }
  }
);

// Xoá phòng
export const deleteRoom = createAsyncThunk(
  "rooms/deleteRoom",
  async (id, thunkAPI) => {
    try {
      await axios.delete(`http://localhost:3000/api/room/${id}`);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Lỗi khi xoá phòng"
      );
    }
  }
);

const roomSlice = createSlice({
  name: "rooms",
  initialState: {
    list: [],
    hotelRooms: [],
    roomDetail: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearRooms: (state) => {
      state.list = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch room detail
      .addCase(fetchRoomById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoomById.fulfilled, (state, action) => {
        state.loading = false;
        state.roomDetail = action.payload;
      })
      .addCase(fetchRoomById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch rooms
      .addCase(fetchRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchRoomsByHotelId
      .addCase(fetchRoomsByHotelId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoomsByHotelId.fulfilled, (state, action) => {
        state.loading = false;
        state.hotelRooms = action.payload;
      })
      .addCase(fetchRoomsByHotelId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add room
      .addCase(addRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(addRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update room
      .addCase(updateRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.map((room) =>
          room.id === action.payload.id ? action.payload : room
        );
      })

      .addCase(updateRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete room
      .addCase(deleteRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter((room) => room.id !== action.payload);
      })
      .addCase(deleteRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearRooms } = roomSlice.actions;
export default roomSlice.reducer;
