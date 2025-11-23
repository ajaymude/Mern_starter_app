import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useGetMeQuery } from "./store/api/authApi";
import { setUser, logout, setLoading } from "./store/slices/authSlice";
import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  const dispatch = useDispatch();

  // For web: try to get user even without token (cookies might be present)
  // For mobile: only query if token exists
  // Skip if we already have user and no token (web with cookies)
  const {
    data: userData,
    error,
    isLoading,
  } = useGetMeQuery(undefined, {
    skip: false, // Always try (cookies work even without token in state)
    // Refetch on mount to verify cookies are still valid
    refetchOnMountOrArgChange: true,
  });

  // Set loading state
  useEffect(() => {
    dispatch(setLoading(isLoading));
  }, [isLoading, dispatch]);

  useEffect(() => {
    if (userData?.data?.user) {
      // Update user in state (this will persist to localStorage)
      dispatch(setUser(userData.data.user));
    } else if (error) {
      // If unauthorized (401), clear auth state
      if (error.status === 401 || error.status === 403) {
        dispatch(logout());
      }
    }
  }, [userData, error, dispatch]);

  return (
    <ErrorBoundary>
      <div
        className="min-h-screen flex flex-col transition-colors duration-300"
        style={{ backgroundColor: "var(--bg-tertiary)" }}
      >
        <Navbar />
        <main className="flex-1">
          <AppRoutes />
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
