import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const getBaseUrl = () => {
  if (import.meta.env.DEV) {
    return "/api/auth";
  }
  return import.meta.env.VITE_API_BASE_URL || "/api/auth";
};

const baseQuery = fetchBaseQuery({
  baseUrl: getBaseUrl(),
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    headers.set("x-client-type", "web");
    return headers;
  },
});

const baseQueryWithLogging = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result.error) {
    console.error("API Error:", {
      status: result.error.status,
      data: result.error.data,
      url: args?.url,
    });

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
