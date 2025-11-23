import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Determine API base URL based on environment
const getBaseUrl = () => {
  // In development, use relative path (Vite proxy handles it)
  if (import.meta.env.DEV) {
    return "/api/auth";
  }
  // In production, use environment variable or default to relative
  return import.meta.env.VITE_API_BASE_URL || "/api/auth";
};

const baseQuery = fetchBaseQuery({
  baseUrl: getBaseUrl(),
  credentials: "include", // Include cookies for web
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    // Only set Authorization header if token exists (for mobile clients)
    // Web clients use cookies automatically via credentials: "include"
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    // Set client type header
    headers.set("x-client-type", "web");
    return headers;
  },
});

// Enhanced base query with error logging
const baseQueryWithLogging = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  // Log errors for debugging
  if (result.error) {
    console.error("API Error:", {
      status: result.error.status,
      data: result.error.data,
      url: args?.url,
    });

    // Check if it's a network error (server not reachable)
    if (result.error.status === "FETCH_ERROR") {
      console.error(
        "Network Error - Server may not be running:",
        result.error.error
      );
    }
  }

  return result;
};

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithLogging,
  tagTypes: ["User"],
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (credentials) => ({
        url: "/register",
        method: "POST",
        body: credentials,
      }),
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
    }),
    refreshToken: builder.mutation({
      query: () => ({
        url: "/refresh",
        method: "POST",
      }),
    }),
    getMe: builder.query({
      query: () => "/me",
      providesTags: ["User"],
    }),
    googleLogin: builder.mutation({
      query: (data) => {
        // Ensure credential is a string
        const credential = typeof data === "string" ? data : data?.credential;

        if (!credential || typeof credential !== "string") {
          throw new Error("Invalid credential format");
        }

        return {
          url: "/google/verify",
          method: "POST",
          body: { credential },
        };
      },
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetMeQuery,
  useGoogleLoginMutation,
} = authApi;
