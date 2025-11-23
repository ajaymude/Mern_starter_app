import { createSlice } from "@reduxjs/toolkit";

const isWeb = typeof localStorage !== "undefined";

const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token, refreshToken } = action.payload;
      state.user = user;
      state.isAuthenticated = true;
      state.isLoading = false;

      if (!isWeb) {
        state.token = token;
        state.refreshToken = refreshToken;
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isLoading = false;
      if (action.payload) {
        state.isAuthenticated = true;
      } else {
        state.isAuthenticated = false;
      }
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setTokens: (state, action) => {
      const { token, refreshToken } = action.payload;
      if (!isWeb) {
        if (token) {
          state.token = token;
        }
        if (refreshToken) {
          state.refreshToken = refreshToken;
        }
      }
    },
  },
});

export const { setCredentials, logout, setUser, setTokens, setLoading } =
  authSlice.actions;

export default authSlice.reducer;
