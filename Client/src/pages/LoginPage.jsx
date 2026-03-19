import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  AtSign,
  Lock,
  ArrowRight,
  Sparkles,
  Building,
  AlertCircle,
} from "lucide-react";
import { saveAuth } from "../utils/authUtils";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      saveAuth(data.token, data.user);

      if (data.user?.role === "lecturer") {
        navigate("/dashboard/lecturer", { replace: true });
      } else {
        navigate("/dashboard/student", { replace: true });
      }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans flex text-gray-900">
      {/* Left Panel - Dark Teal Gradient (Hidden on smaller screens) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#123533] bg-gradient-to-br from-[#123533] to-[#0c2422] p-12 flex-col justify-between relative overflow-hidden">
        {/* Subtle background glow effect */}
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col h-full">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 w-fit mb-16 hover:opacity-90 transition-opacity">
            <div className="w-10 h-10 bg-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <GraduationCap className="w-6 h-6 text-[#123533]" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Smart Study Circle
            </span>
          </Link>

          {/* Hero Typography */}
          <div className="mb-12">
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              <span className="text-white block">Unlock Your</span>
              <span className="text-cyan-400 block">Academic</span>
              <span className="text-cyan-400 block">Potential</span>
            </h1>
            <p className="text-teal-50 text-lg leading-relaxed max-w-md">
              Join the most innovative peer-led learning platform. Connect with
              experts, share resources, and excel together.
            </p>
          </div>

          {/* Image/UI Element */}
          <div className="mt-auto relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
            {/* Image placeholder */}
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
              alt="Students studying"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#123533]/90 via-[#123533]/20 to-transparent"></div>

            {/* AI Pill overlay */}
            <div className="absolute top-6 left-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
              <div className="w-6 h-6 rounded-full bg-cyan-400 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-[#123533]" />
              </div>
              <span className="text-white text-sm font-semibold tracking-wide">
                AI Study Buddy Active
              </span>
            </div>

            {/* Bottom Right overlay */}
            <div className="absolute bottom-6 right-6 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-4 shadow-xl">
              <div className="flex -space-x-3">
                <div className="w-8 h-8 rounded-full border-2 border-[#123533] bg-gray-300">
                  <img src="https://i.pravatar.cc/100?img=1" alt="Avatar" className="w-full h-full rounded-full object-cover" />
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-[#123533] bg-gray-400">
                  <img src="https://i.pravatar.cc/100?img=2" alt="Avatar" className="w-full h-full rounded-full object-cover" />
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-[#123533] bg-gray-500">
                  <img src="https://i.pravatar.cc/100?img=3" alt="Avatar" className="w-full h-full rounded-full object-cover" />
                </div>
              </div>
              <span className="text-white text-xs font-medium">
                <strong className="font-bold text-white">1.2k</strong> students studying right now
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-[#111827] mb-3 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-gray-500 text-sm font-medium">
              Please enter your details to sign in to your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-bold text-[#111827]"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <AtSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 hover:border-gray-300 transition-colors bg-white text-gray-900 placeholder-gray-400 outline-none"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2 pb-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-bold text-[#111827]"
                >
                  Password
                </label>
                <a
                  href="#"
                  className="text-sm font-semibold text-cyan-600 hover:text-cyan-500 transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 hover:border-gray-300 transition-colors bg-white text-gray-900 placeholder-gray-400 outline-none font-medium tracking-widest"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Error alert */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm shadow-cyan-500/30 text-base font-bold text-[#123533] bg-cyan-400 hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#123533]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                <>
                  Log In
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 mb-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-400 font-semibold tracking-wider text-xs uppercase">
                Or continue with
              </span>
            </div>
          </div>

            {/* Social Buttons */}
          <div className="grid grid-cols-3 gap-3">
            {/* Google Button */}
            <button
              type="button"
              className="w-full flex items-center justify-center py-2.5 px-3 border border-gray-200 rounded-xl shadow-sm bg-white hover:bg-gray-50 hover:border-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
              title="Sign in with Google"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </button>
            
            {/* Microsoft Button */}
            <button
              type="button"
              className="w-full flex items-center justify-center py-2.5 px-3 border border-gray-200 rounded-xl shadow-sm bg-white hover:bg-gray-50 hover:border-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
              title="Sign in with Microsoft"
            >
              <svg className="w-5 h-5" viewBox="0 0 21 21">
                <path fill="#f35325" d="M1 1h9v9H1z"/>
                <path fill="#81bc06" d="M11 1h9v9h-9z"/>
                <path fill="#05a6f0" d="M1 11h9v9H1z"/>
                <path fill="#ffba08" d="M11 11h9v9h-9z"/>
              </svg>
            </button>

            {/* Apple Button */}
            <button
              type="button"
              className="w-full flex items-center justify-center py-2.5 px-3 border border-gray-200 rounded-xl shadow-sm bg-black hover:bg-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
              title="Sign in with Apple"
            >
              <svg className="w-5 h-5" viewBox="0 0 384 512">
                <path fill="#ffffff" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
              </svg>
            </button>
          </div>

          <div className="mt-10 text-center text-sm">
            <span className="text-gray-500 font-medium">Don't have an account yet?</span>{" "}
            <Link
              to="/register"
              className="font-bold text-[#0d9488] hover:text-[#06b6d4] transition-colors"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
