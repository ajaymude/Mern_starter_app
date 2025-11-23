import { useSelector } from "react-redux";

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="flex-1 p-8 flex justify-center">
      <div
        className="p-10 rounded-lg shadow-md w-full max-w-4xl transition-colors duration-300"
        style={{ backgroundColor: "var(--bg-card)" }}
      >
        <h1
          className="mb-6 text-3xl font-bold"
          style={{ color: "var(--text-heading)" }}
        >
          Welcome to Dashboard
        </h1>
        <div
          className="p-6 rounded mb-8 transition-colors duration-300"
          style={{ backgroundColor: "var(--bg-secondary)" }}
        >
          <p className="my-2 text-lg" style={{ color: "var(--text-body)" }}>
            <strong className="font-semibold">Name:</strong> {user?.name}
          </p>
          <p className="my-2 text-lg" style={{ color: "var(--text-body)" }}>
            <strong className="font-semibold">Email:</strong> {user?.email}
          </p>
        </div>
        <div className="mt-8">
          <h2
            className="mb-4 text-2xl font-semibold"
            style={{ color: "var(--text-heading)" }}
          >
            Your MERN Starter Project is Ready!
          </h2>
          <p
            className="leading-relaxed mb-6 text-base"
            style={{ color: "var(--text-tertiary)" }}
          >
            This is a protected route. Only authenticated users can access this
            page.
          </p>
          <div
            className="p-6 rounded transition-colors duration-300"
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            <h3
              className="mb-4 text-xl font-semibold"
              style={{ color: "var(--text-heading)" }}
            >
              Features Included:
            </h3>
            <ul className="list-none p-0">
              <li
                className="py-2 text-base"
                style={{ color: "var(--text-body)" }}
              >
                ✅ User Authentication (Login/Signup)
              </li>
              <li
                className="py-2 text-base"
                style={{ color: "var(--text-body)" }}
              >
                ✅ Protected Routes
              </li>
              <li
                className="py-2 text-base"
                style={{ color: "var(--text-body)" }}
              >
                ✅ Redux Toolkit with RTK Query
              </li>
              <li
                className="py-2 text-base"
                style={{ color: "var(--text-body)" }}
              >
                ✅ JWT Token Management
              </li>
              <li
                className="py-2 text-base"
                style={{ color: "var(--text-body)" }}
              >
                ✅ Error Handling
              </li>
              <li
                className="py-2 text-base"
                style={{ color: "var(--text-body)" }}
              >
                ✅ Modern UI Components with Tailwind CSS
              </li>
              <li
                className="py-2 text-base"
                style={{ color: "var(--text-body)" }}
              >
                ✅ Production Build Support
              </li>
              <li
                className="py-2 text-base"
                style={{ color: "var(--text-body)" }}
              >
                ✅ Dark Mode Support
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
