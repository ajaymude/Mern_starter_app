import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { useLoginMutation, useGoogleLoginMutation } from "../store/api/authApi";
import { setCredentials } from "../store/slices/authSlice";
import GoogleSignInButton from "../components/GoogleSignInButton";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const [googleLogin] = useGoogleLoginMutation();

  const handleGoogleCredential = async (credential) => {
    try {
      setError("");
      console.log("handleGoogleCredential called with credential:", {
        hasCredential: !!credential,
        credentialType: typeof credential,
        credentialLength: credential?.length || 0,
        credentialPreview: credential
          ? `${credential.substring(0, 50)}...`
          : "none",
      });

      if (!credential || typeof credential !== "string") {
        const errorMsg = "Invalid Google credential received";
        console.error(errorMsg, { credential, type: typeof credential });
        setError(errorMsg);
        return;
      }

      console.log("Calling googleLogin API...");
      const result = await googleLogin({ credential }).unwrap();
      console.log("Google login API response:", result);

      if (result.status === "success") {
        console.log("Login successful, setting credentials and navigating...");
        dispatch(
          setCredentials({
            user: result.data.user,
            token: result.data.token || null,
            refreshToken: result.data.refreshToken || null,
          })
        );
        navigate("/dashboard");
      } else {
        console.warn("Login response status is not 'success':", result);
        setError("Login response was not successful");
      }
    } catch (err) {
      console.error("Google login error:", {
        error: err,
        status: err?.status,
        data: err?.data,
        message: err?.data?.message || err?.message,
      });
      setError(
        err?.data?.message ||
          err?.message ||
          "Google login failed. Please try again."
      );
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

    try {
      const result = await login(formData).unwrap();
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
      setError(err?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-80px)] p-8">
      <div
        className="p-10 rounded-lg shadow-md w-full max-w-md transition-colors duration-300"
        style={{
          backgroundColor: "var(--bg-card)",
        }}
      >
        <h2
          className="mb-6 text-center text-2xl font-bold"
          style={{ color: "var(--text-heading)" }}
        >
          Login
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
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-base font-medium rounded transition-colors duration-300 mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Logging in..." : "Login"}
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
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="font-medium transition-colors duration-300"
            style={{ color: "var(--text-link)" }}
            onMouseEnter={(e) =>
              (e.target.style.color = "var(--text-link-hover)")
            }
            onMouseLeave={(e) => (e.target.style.color = "var(--text-link)")}
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
