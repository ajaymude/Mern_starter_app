import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { useLogoutMutation } from "../store/api/authApi";
import { useTheme } from "../contexts/ThemeContext";

const Sidebar = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { toggleTheme, isDark } = useTheme();

  const [logoutMutation] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch(logout());
      navigate("/login");
      onClose();
    }
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = isAuthenticated
    ? [
        { path: "/dashboard", label: "Dashboard", icon: "📊" },
        { path: "/profile", label: "Profile", icon: "👤" },
        { path: "/settings", label: "Settings", icon: "⚙️" },
      ]
    : [];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/80 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: 'var(--bg-card)' }}
      >
        <div className="flex flex-col h-full">
          <div 
            className="p-6 border-b"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <div className="flex items-center justify-between">
              <h2 
                className="text-xl font-bold"
                style={{ color: 'var(--text-heading)' }}
              >
                MERN Starter
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg transition-colors"
                style={{
                  color: 'var(--text-tertiary)',
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                aria-label="Close sidebar"
              >
                ✕
              </button>
            </div>
          </div>

          {isAuthenticated && (
            <div 
              className="p-4 border-b"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p 
                    className="text-sm font-medium truncate"
                    style={{ color: 'var(--text-heading)' }}
                  >
                    {user?.name || "User"}
                  </p>
                  <p 
                    className="text-xs truncate"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          <nav className="flex-1 overflow-y-auto p-4">
            {isAuthenticated ? (
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={onClose}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200"
                      style={{
                        backgroundColor: isActive(item.path) ? 'var(--color-primary)' : 'transparent',
                        color: isActive(item.path) ? '#ffffff' : 'var(--text-body)',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive(item.path)) {
                          e.target.style.backgroundColor = 'var(--bg-hover)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive(item.path)) {
                          e.target.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/login"
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200"
                    style={{
                      backgroundColor: isActive("/login") ? 'var(--color-primary)' : 'transparent',
                      color: isActive("/login") ? '#ffffff' : 'var(--text-body)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive("/login")) {
                        e.target.style.backgroundColor = 'var(--bg-hover)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive("/login")) {
                        e.target.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <span className="text-lg">🔐</span>
                    <span className="font-medium">Login</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/signup"
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200"
                    style={{
                      backgroundColor: isActive("/signup") ? 'var(--color-primary)' : 'transparent',
                      color: isActive("/signup") ? '#ffffff' : 'var(--text-body)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive("/signup")) {
                        e.target.style.backgroundColor = 'var(--bg-hover)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive("/signup")) {
                        e.target.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <span className="text-lg">📝</span>
                    <span className="font-medium">Sign Up</span>
                  </Link>
                </li>
              </ul>
            )}
          </nav>

          <div 
            className="p-4 border-t space-y-2"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200"
              style={{ color: 'var(--text-body)' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-hover)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <span className="text-lg">{isDark ? "☀️" : "🌙"}</span>
              <span className="font-medium">
                {isDark ? "Light Mode" : "Dark Mode"}
              </span>
            </button>

            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-danger hover:bg-danger-hover text-white transition-colors duration-200 font-medium"
              >
                <span className="text-lg">🚪</span>
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

