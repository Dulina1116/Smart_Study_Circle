import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  AtSign,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // If already authenticated, skip straight to dashboard
  useEffect(() => {
    if (sessionStorage.getItem("adminAuth") === "true") {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate a short async check so it feels like a real auth call
    await new Promise((r) => setTimeout(r, 600));

    const validEmail = import.meta.env.VITE_ADMIN_EMAIL;
    const validPassword = import.meta.env.VITE_ADMIN_PASSWORD;

    if (email === validEmail && password === validPassword) {
      sessionStorage.setItem("adminAuth", "true");
      navigate("/admin/dashboard", { replace: true });
    } else {
      setError("Invalid credentials. Please check your email and password.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans flex text-gray-900">
      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0c1f1e] to-[#123533] p-12 flex-col justify-between relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/3 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col h-full">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 w-fit mb-16 hover:opacity-90 transition-opacity"
          >
            <div className="w-10 h-10 bg-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <GraduationCap className="w-6 h-6 text-[#123533]" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Smart Study Circle
            </span>
          </Link>

          {/* Hero text */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 bg-cyan-400/10 border border-cyan-400/20 rounded-full px-4 py-1.5 mb-6">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-300 text-sm font-semibold tracking-wide">
                Admin Portal
              </span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              <span className="text-white block">Manage &amp;</span>
              <span className="text-cyan-400 block">Control</span>
              <span className="text-cyan-400 block">Everything</span>
            </h1>
            <p className="text-teal-100/80 text-lg leading-relaxed max-w-md">
              Access the administration panel to oversee users, study circles,
              resources, and platform analytics.
            </p>
          </div>

          {/* Feature pills */}
          <div className="mt-auto space-y-3">
            {[
              "User & circle management",
              "Analytics & reporting",
              "Content moderation",
            ].map((feat) => (
              <div
                key={feat}
                className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3"
              >
                <div className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" />
                <span className="text-teal-50 text-sm font-medium">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel — Login Form ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-10 text-center lg:text-left">
            {/* Mobile logo */}
            <Link
              to="/"
              className="lg:hidden inline-flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-cyan-400 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-[#123533]" />
              </div>
              <span className="text-base font-bold text-gray-900">
                Smart Study Circle
              </span>
            </Link>

            <div className="flex items-center gap-2 mb-3 justify-center lg:justify-start">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <ShieldCheck className="w-4.5 h-4.5 text-cyan-600" />
              </div>
              <span className="text-xs font-bold text-cyan-600 tracking-widest uppercase">
                Admin Access
              </span>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
              Sign in to your portal
            </h2>
            <p className="text-gray-500 text-sm">
              Enter your administrator credentials to continue.
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="admin-email"
                className="block text-sm font-bold text-gray-900"
              >
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <AtSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 hover:border-gray-300 transition-colors bg-white text-gray-900 placeholder-gray-400 outline-none"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2 pb-2">
              <label
                htmlFor="admin-password"
                className="block text-sm font-bold text-gray-900"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="admin-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 hover:border-gray-300 transition-colors bg-white text-gray-900 placeholder-gray-400 outline-none font-medium tracking-widest"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-sm shadow-cyan-500/30 text-base font-bold text-[#123533] bg-cyan-400 hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#123533]"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Verifying…
                </>
              ) : (
                <>
                  Login
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Back to home */}
          <div className="mt-8 text-center text-sm">
            <Link
              to="/"
              className="text-gray-500 hover:text-teal-600 font-medium transition-colors inline-flex items-center gap-1"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
