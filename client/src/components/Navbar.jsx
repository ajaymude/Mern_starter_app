import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { useTheme } from "../contexts/ThemeContext";
import Sidebar from "./Sidebar";

const Navbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { toggleTheme, isDark } = useTheme();

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (sidebarOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [sidebarOpen, isMobile]);

  const handleLogout = async () => {
    try {
      // Call logout API to clear cookies on server
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch(logout());
      navigate("/login");
    }
  };

  return (
    <>
      <nav
        className="text-white shadow-lg transition-all duration-300 border-b border-primary/20 sticky top-0 z-30"
        style={{
          background: isDark
            ? "var(--bg-navbar)"
            : `linear-gradient(to right, var(--color-primary-dark), var(--color-primary), var(--color-primary-dark))`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left Section - Logo & Menu Button */}
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
                aria-label="Toggle menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {sidebarOpen ? (
                    <path d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>

              {/* Logo */}
              <Link
                to="/"
                className="text-xl sm:text-2xl font-bold text-white hover:text-primary-light transition-colors duration-300"
              >
                MERN Starter
              </Link>
            </div>

            {/* Right Section - Desktop Menu */}
            <div className="hidden lg:flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 dark:bg-gray-900/30 dark:hover:bg-gray-900/50 border border-white/20 dark:border-gray-800 rounded-lg text-sm transition-all duration-300 flex items-center gap-2 hover:scale-105 active:scale-95 backdrop-blur-sm"
                title={`Switch to ${isDark ? "light" : "dark"} theme`}
              >
                <span className="text-lg">{isDark ? "☀️" : "🌙"}</span>
              </button>
              {isAuthenticated ? (
                <>
                  <span className="text-sm font-medium text-white/90 hidden xl:inline">
                    Welcome,{" "}
                    <span className="text-primary-light font-semibold">
                      {user?.name || "User"}
                    </span>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-danger hover:bg-danger-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-white font-medium hover:text-primary-light transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-white/10 dark:hover:bg-gray-900/50"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-white/20 hover:bg-white/30 dark:bg-gray-900/40 dark:hover:bg-gray-900/60 text-white font-medium px-4 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 backdrop-blur-sm"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Right Section - Theme Toggle Only */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300"
                title={`Switch to ${isDark ? "light" : "dark"} theme`}
              >
                <span className="text-lg">{isDark ? "☀️" : "🌙"}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar Component */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
};

export default Navbar;
