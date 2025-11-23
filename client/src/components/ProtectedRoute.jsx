import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useSelector(
    (state) => state.auth
  );

  // Show loading state while checking authentication
  // This prevents flash of login page when cookies are being verified
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: "var(--color-primary)" }}
          ></div>
          <p style={{ color: "var(--text-secondary)" }}>Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and not loading, redirect to login
  if (!isAuthenticated && !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
