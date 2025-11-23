import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  useRegisterMutation,
  useGoogleLoginMutation,
} from "../store/api/authApi";
import { setCredentials } from "../store/slices/authSlice";
import GoogleSignInButton from "../components/GoogleSignInButton";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();
  const [googleLogin] = useGoogleLoginMutation();

  const handleGoogleCredential = async (credential) => {
    try {
      setError("");

      if (!credential || typeof credential !== "string") {
        setError("Invalid Google credential received");
        return;
      }

      const result = await googleLogin({ credential }).unwrap();

      if (result.status === "success") {
        dispatch(
          setCredentials({
            user: result.data.user,
            token: result.data.token || null,
            refreshToken: result.data.refreshToken || null,
          })
        );
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err?.data?.message || "Google signup failed. Please try again.");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      }).unwrap();

      if (result.status === "success") {
        dispatch(
          setCredentials({
            user: result.data.user,
            token: result.data.token || null,
            refreshToken: result.data.refreshToken || null,
          })
        );
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err?.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-80px)] p-8">
      <div
        className="p-10 rounded-lg shadow-md w-full max-w-md transition-colors duration-300"
        style={{ backgroundColor: "var(--bg-card)" }}
      >
        <h2
          className="mb-6 text-center text-2xl font-bold"
          style={{ color: "var(--text-heading)" }}
        >
          Sign Up
        </h2>
        {error && (
          <div
            className="p-3 rounded mb-4 text-center text-sm"
            style={{
              backgroundColor: "var(--color-danger-light)",
              color: "var(--text-error)",
            }}
          >
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="name"
              className="block mb-2 font-medium text-sm"
              style={{ color: "var(--text-label)" }}
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded text-base transition-colors duration-300 focus:ring-2 focus:ring-primary/20 outline-none"
              style={{
                borderColor: "var(--border-color)",
                backgroundColor: "var(--bg-input)",
                color: "var(--text-input)",
              }}
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="email"
              className="block mb-2 font-medium text-sm"
              style={{ color: "var(--text-label)" }}
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded text-base transition-colors duration-300 focus:ring-2 focus:ring-primary/20 outline-none"
              style={{
                borderColor: "var(--border-color)",
                backgroundColor: "var(--bg-input)",
                color: "var(--text-input)",
              }}
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block mb-2 font-medium text-sm"
              style={{ color: "var(--text-label)" }}
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded text-base transition-colors duration-300 focus:ring-2 focus:ring-primary/20 outline-none"
              style={{
                borderColor: "var(--border-color)",
                backgroundColor: "var(--bg-input)",
                color: "var(--text-input)",
              }}
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="confirmPassword"
              className="block mb-2 font-medium text-sm"
              style={{ color: "var(--text-label)" }}
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded text-base transition-colors duration-300 focus:ring-2 focus:ring-primary/20 outline-none"
              style={{
                borderColor: "var(--border-color)",
                backgroundColor: "var(--bg-input)",
                color: "var(--text-input)",
              }}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-base font-medium rounded transition-colors duration-300 mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <div className="flex items-center my-6">
          <div
            className="flex-1 border-t"
            style={{ borderColor: "var(--border-color)" }}
          ></div>
          <span
            className="px-4 text-sm"
            style={{ color: "var(--text-tertiary)" }}
          >
            OR
          </span>
          <div
            className="flex-1 border-t"
            style={{ borderColor: "var(--border-color)" }}
          ></div>
        </div>

        <GoogleSignInButton
          onCredential={handleGoogleCredential}
          onError={setError}
        />

        <p
          className="text-center mt-6 text-sm"
          style={{ color: "var(--text-tertiary)" }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium transition-colors duration-300"
            style={{ color: "var(--text-link)" }}
            onMouseEnter={(e) =>
              (e.target.style.color = "var(--text-link-hover)")
            }
            onMouseLeave={(e) => (e.target.style.color = "var(--text-link)")}
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
