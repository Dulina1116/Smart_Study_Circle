import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Users,
  BookOpen,
  UploadCloud,
  Activity,
  LogOut,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

const stats = [
  {
    label: "Total Users",
    value: "2,841",
    change: "+12% this month",
    icon: Users,
    color: "bg-cyan-50 text-cyan-600",
    trend: "up",
  },
  {
    label: "Active Circles",
    value: "184",
    change: "+7 new today",
    icon: BookOpen,
    color: "bg-teal-50 text-teal-600",
    trend: "up",
  },
  {
    label: "Resources Uploaded",
    value: "9,320",
    change: "+230 this week",
    icon: UploadCloud,
    color: "bg-indigo-50 text-indigo-600",
    trend: "up",
  },
  {
    label: "Sessions Today",
    value: "1,203",
    change: "Active right now",
    icon: Activity,
    color: "bg-amber-50 text-amber-600",
    trend: "neutral",
  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL ?? "admin";

  // Guard — redirect if not authenticated
  useEffect(() => {
    if (sessionStorage.getItem("adminAuth") !== "true") {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuth");
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* ── Top Bar ── */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cyan-400 rounded-lg flex items-center justify-center shadow-sm">
              <GraduationCap className="w-5 h-5 text-[#123533]" />
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">
              Smart Study Circle
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 ml-2 px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-700 text-xs font-semibold">
              <ShieldCheck className="w-3 h-3" />
              Admin
            </span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Welcome Banner */}
        <div className="mb-10 rounded-2xl bg-gradient-to-br from-[#0c1f1e] to-[#123533] p-8 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <p className="text-cyan-300 text-sm font-semibold tracking-widest uppercase mb-2">
              Welcome back
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-teal-200/80 text-sm">
              Signed in as{" "}
              <span className="text-cyan-300 font-semibold">{adminEmail}</span>
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map(({ label, value, change, icon: Icon, color, trend }) => (
            <div
              key={label}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {trend === "up" && (
                  <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                    <TrendingUp className="w-3 h-3" />
                    Up
                  </span>
                )}
              </div>
              <p className="text-2xl font-extrabold text-gray-900 mb-1">{value}</p>
              <p className="text-sm font-medium text-gray-500">{label}</p>
              <p className="text-xs text-gray-400 mt-1">{change}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Manage Users", desc: "View, edit or deactivate user accounts", icon: Users, color: "text-cyan-600 bg-cyan-50" },
              { label: "Study Circles", desc: "Review and moderate active circles", icon: BookOpen, color: "text-teal-600 bg-teal-50" },
              { label: "Platform Analytics", desc: "Detailed engagement metrics", icon: Activity, color: "text-indigo-600 bg-indigo-50" },
            ].map(({ label, desc, icon: Icon, color }) => (
              <button
                key={label}
                className="flex items-start gap-4 p-5 rounded-xl border border-gray-100 hover:border-cyan-200 hover:bg-cyan-50/30 transition-all duration-200 text-left group"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800 group-hover:text-teal-700 transition-colors">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
