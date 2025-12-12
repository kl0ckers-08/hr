import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LayoutGrid } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const DEMO_ACCOUNTS = [
  {
    role: "Super Admin:",
    email: "superadmin@hr3.com",
    pass: "SuperAdmin123!",
  },
  { role: "HR Admin:", email: "hradmin@hr3.com", pass: "HRAdmin123!" },
  { role: "Dean:", email: "edward.king0@hr3.com", pass: "Dean123!" },
  { role: "Lecturer:", email: "betty.sanchez1000@hr3.com", pass: "Lecturer123!" },
  { role: "Admin Staff:", email: "nicole.nelson2000@hr3.com", pass: "AdminStaff123!" },
];

const roleDashboardMap: Record<string, string> = {
  superadmin: "/dashboard",
  hradmin: "/hr-admin",
  dean: "/dean",
  lecturer: "/lecturer",
  adminstaff: "/admin-staff",
};

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { login, logout, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const dashboard = roleDashboardMap[user.role] || "/dashboard";
      navigate(dashboard, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleDemoClick = async (demoEmail: string, demoPass: string) => {
    logout();
    setEmail(demoEmail);
    setPassword(demoPass);
    setError("");
    setIsSubmitting(true);

    const result = await login(demoEmail, demoPass);
    if (!result.success) {
      setError(result.error || "Login failed");
    }
    setIsSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    logout();
    setError("");
    setIsSubmitting(true);

    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || "Login failed");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-container">
            <LayoutGrid size={28} />
          </div>
          <h1>Sign In</h1>
          <p className="subtitle">Access your HR3 Management System</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="your.email@hr3.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <div className="label-row">
              <label htmlFor="password">Password</label>
              <a href="#" className="forgot-password">
                Forgot Password?
              </a>
            </div>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="demo-accounts">
          <h3>Demo Accounts</h3>
          <div className="demo-list">
            {DEMO_ACCOUNTS.map((acc, index) => (
              <div
                key={index}
                className="demo-item"
                onClick={() =>
                  !isSubmitting && handleDemoClick(acc.email, acc.pass)
                }
                style={{
                  opacity: isSubmitting ? 0.5 : 1,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                }}
              >
                <p className="demo-role">
                  {acc.role} <span className="demo-email">{acc.email}</span>
                </p>
                <p className="demo-pass">| {acc.pass}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
