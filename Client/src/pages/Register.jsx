import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AtSign,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Sparkles,
  User,
} from "lucide-react";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "student",
  });

  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pwStrength, setPwStrength] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "password") checkStrength(e.target.value);
  };

  const checkStrength = (pw) => {
    if (!pw) {
      setPwStrength(null);
      return;
    }

    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    const levels = [
      { width: "10%", color: "#ef4444", label: "Too Short" },
      { width: "20%", color: "#ef4444", label: "Very Weak" },
      { width: "40%", color: "#f97316", label: "Weak" },
      { width: "60%", color: "#eab308", label: "Fair" },
      { width: "80%", color: "#22c55e", label: "Strong" },
      { width: "100%", color: "#00b8a9", label: "Very Strong" },
    ];

    setPwStrength(levels[Math.min(score, 5)]);
  };

  const studentEmailPattern = /^[^\s@]+@my\.sliit\.lk$/i;

  const validate = () => {
    const e = {};
    if (!formData.fullName.trim()) e.fullName = "⚠ Full name is required.";
    else if (formData.fullName.trim().length < 3)
      e.fullName = "⚠ At least 3 characters required.";

    if (!formData.email.trim()) e.email = "⚠ Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = "⚠ Enter a valid email address.";
    else if (
      formData.role === "student" &&
      !studentEmailPattern.test(formData.email.trim())
    )
      e.email = "⚠ Student email must end with @my.sliit.lk";

    if (!formData.password) e.password = "⚠ Password is required.";
    else if (formData.password.length < 8)
      e.password = "⚠ Minimum 8 characters required.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      localStorage.setItem("tempEmail", formData.email);
      navigate("/verify");
    } catch (err) {
      setErrors({ api: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans flex text-gray-900">
      <div className="hidden lg:flex lg:w-1/2 bg-[#123533] bg-gradient-to-br from-[#123533] to-[#0c2422] p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col h-full">
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

          <div className="mt-auto relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
              alt="Students studying"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#123533]/90 via-[#123533]/20 to-transparent"></div>

            <div className="absolute top-6 left-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
              <div className="w-6 h-6 rounded-full bg-cyan-400 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-[#123533]" />
              </div>
              <span className="text-white text-sm font-semibold tracking-wide">
                AI Study Buddy Active
              </span>
            </div>

            <div className="absolute bottom-6 right-6 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-4 shadow-xl">
              <div className="flex -space-x-3">
                <div className="w-8 h-8 rounded-full border-2 border-[#123533] bg-gray-300">
                  <img
                    src="https://i.pravatar.cc/100?img=1"
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-[#123533] bg-gray-400">
                  <img
                    src="https://i.pravatar.cc/100?img=2"
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-[#123533] bg-gray-500">
                  <img
                    src="https://i.pravatar.cc/100?img=3"
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
              <span className="text-white text-xs font-medium">
                <strong className="font-bold text-white">1.2k</strong> students
                studying right now
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-[#111827] mb-3 tracking-tight">
              Create Account
            </h2>
            <p className="text-gray-500 text-sm font-medium">
              Start your journey to smarter learning today.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#111827]">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`block w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 hover:border-gray-300 transition-colors bg-white text-gray-900 placeholder-gray-400 outline-none ${
                    errors.fullName ? "border-red-400" : "border-gray-200"
                  }`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.fullName && (
                <p className="text-red-500 text-xs font-medium">
                  {errors.fullName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#111827]">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <AtSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 hover:border-gray-300 transition-colors bg-white text-gray-900 placeholder-gray-400 outline-none ${
                    errors.email ? "border-red-400" : "border-gray-200"
                  }`}
                  placeholder={
                    formData.role === "student"
                      ? "registrationnumber@my.sliit.lk"
                      : "name@example.com"
                  }
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#111827]">
                Create Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPw ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-11 pr-11 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 hover:border-gray-300 transition-colors bg-white text-gray-900 placeholder-gray-400 outline-none ${
                    errors.password ? "border-red-400" : "border-gray-200"
                  }`}
                  placeholder="Min. 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-cyan-500 transition-colors"
                >
                  {showPw ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {pwStrength && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: pwStrength.width,
                        background: pwStrength.color,
                      }}
                    />
                  </div>
                  <span
                    className="text-[0.7rem] font-semibold min-w-[64px] text-right"
                    style={{ color: pwStrength.color }}
                  >
                    {pwStrength.label}
                  </span>
                </div>
              )}
              {errors.password && (
                <p className="text-red-500 text-xs font-medium">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#111827]">
                Join as a
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "student", icon: "🎓", label: "Student" },
                  { value: "lecturer", icon: "🧑‍🏫", label: "Lecturer" },
                ].map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: r.value })}
                    className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all ${
                      formData.role === r.value
                        ? "border-cyan-500 bg-cyan-50 shadow-[0_0_0_3px_rgba(6,182,212,0.2)]"
                        : "border-gray-200 bg-white hover:border-cyan-300"
                    }`}
                  >
                    <span className="text-2xl">{r.icon}</span>
                    <strong
                      className={`text-sm font-semibold ${
                        formData.role === r.value
                          ? "text-cyan-600"
                          : "text-[#111827]"
                      }`}
                    >
                      {r.label}
                    </strong>
                  </button>
                ))}
              </div>
            </div>

            {errors.api && (
              <p className="text-red-500 text-sm text-center">
                {errors.api}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-cyan-400 text-[#0c2422] hover:bg-cyan-300 transition-colors shadow-lg shadow-cyan-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "⏳ Creating Account..." : "Create Account →"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-cyan-600 hover:text-cyan-500"
            >
              Log in to your account
            </Link>
          </p>
          <p className="text-center text-[0.68rem] mt-3 leading-relaxed text-gray-400">
            By signing up, you agree to our{" "}
            <a href="#" className="text-cyan-600 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-cyan-600 hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
