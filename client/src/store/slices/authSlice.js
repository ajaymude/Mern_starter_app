import { createSlice } from "@reduxjs/toolkit";

// Check if we're on web (has localStorage) or mobile
const isWeb = typeof localStorage !== "undefined";

// Don't load user from localStorage for security reasons
// User data will be fetched from server via /me API
// Cookies handle authentication, no need to persist user data
const initialState = {
  user: null, // Always start with null, fetch from server
  // For web: Don't store tokens - cookies handle authentication
  // For mobile: tokens are needed in state/storage
  token: null, // Web uses cookies, mobile will set this
  refreshToken: null, // Web uses cookies, mobile will set this
  // Authentication state determined by server response
  isAuthenticated: false,
  isLoading: true, // Start as loading to fetch user from server
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

      // Don't store user data in localStorage for security
      // Cookies handle authentication, user data fetched from server on refresh
      // This prevents XSS attacks from accessing user data

      // For web: Don't store tokens - cookies handle authentication
      // For mobile: Store tokens in state (cookies not available)
      if (!isWeb) {
        // Mobile apps need tokens in state/storage
        state.token = token;
        state.refreshToken = refreshToken;
      }
      // Web: tokens are in httpOnly cookies, don't store in localStorage
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      // Cookies cleared by server, no localStorage cleanup needed
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isLoading = false;
      // If user is set, we're authenticated (cookies or token working)
      if (action.payload) {
        state.isAuthenticated = true;
      } else {
        state.isAuthenticated = false;
      }
      // Don't store user in localStorage - security best practice
      // User data fetched from server on each app load
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setTokens: (state, action) => {
      const { token, refreshToken } = action.payload;
      // Only store tokens for mobile (web uses cookies)
      if (!isWeb) {
        if (token) {
          state.token = token;
        }
        if (refreshToken) {
          state.refreshToken = refreshToken;
        }
      }
      // Web: tokens are in httpOnly cookies, don't store in localStorage
    },
  },
});

export const { setCredentials, logout, setUser, setTokens, setLoading } =
  authSlice.actions;

export default authSlice.reducer;
