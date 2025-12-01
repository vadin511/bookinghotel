/* eslint-disable @typescript-eslint/no-unused-vars */
// features/postSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// --- Fetch all posts
export const fetchPosts = createAsyncThunk("posts/fetchPosts", async () => {
  const res = await axios.get("/api/posts");
  return res.data;
});

// --- Add post
export const addPost = createAsyncThunk("posts/addPost", async (postData) => {
  const res = await axios.post("/api/posts", postData);
  return res.data;
});

// --- Update post
export const updatePost = createAsyncThunk("posts/updatePost", async ({ id, data }) => {
  const res = await axios.put(`/api/posts/${id}`, data);
  // Trả về dữ liệu từ server nếu có, nếu không thì merge với data gửi lên
  return res.data && res.data.id ? res.data : { id, ...data, ...res.data };
});

// --- Delete post
export const deletePost = createAsyncThunk("posts/deletePost", async (id) => {
  await axios.delete(`/api/posts/${id}`);
  return id;
});

const postSlice = createSlice({
  name: "posts",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    resetPosts: (state) => {
      state.list = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // --- Add
      .addCase(addPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPost.fulfilled, (state, action) => {
        state.loading = false;
        // Thêm bài viết mới vào đầu danh sách
        const newPost = action.payload;
        if (newPost && newPost.id) {
          state.list.unshift(newPost);
        }
      })
      .addCase(addPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // --- Update
      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.list.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = { ...state.list[index], ...action.payload };
        }
      })

      // --- Delete
      .addCase(deletePost.fulfilled, (state, action) => {
        state.list = state.list.filter((p) => p.id !== action.payload);
      });
  },
});

// --- Actions thường
export const { resetPosts } = postSlice.actions;

// --- Selectors
export const selectPosts = (state) => state.posts.list;
export const selectPostStatus = (state) => ({
  loading: state.posts.loading,
  error: state.posts.error,
});
export const selectPostById = (id) => (state) =>
  state.posts.list.find((p) => p.id === id);

export default postSlice.reducer;




