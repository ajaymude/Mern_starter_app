import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useGetMeQuery } from "./store/api/authApi";
import { setUser, logout, setLoading } from "./store/slices/authSlice";
import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  const dispatch = useDispatch();

  const {
    data: userData,
    error,
    isLoading,
  } = useGetMeQuery(undefined, {
    skip: false,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    dispatch(setLoading(isLoading));
  }, [isLoading, dispatch]);

  useEffect(() => {
    if (userData?.data?.user) {
      dispatch(setUser(userData.data.user));
    } else if (error) {
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
