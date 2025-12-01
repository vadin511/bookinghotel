import { configureStore } from "@reduxjs/toolkit";
import bookingsReducer from "./features/bookingsSlide";
import hotelReducer from "./features/hotelSlice";
import roomReducer from "./features/roomSlice";
import userReducer from "./features/userSlice";
import bannerReducer from "./features/bannerSlice";
import postReducer from "./features/postSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    rooms: roomReducer,
    hotels: hotelReducer,
    bookings: bookingsReducer,
    banners: bannerReducer,
    posts: postReducer,
  },
});
