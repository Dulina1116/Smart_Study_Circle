import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  BookOpen,
  Activity,
  Flag,
  Gavel,
  Settings,
  Search,
  Bell,
  Clock,
  Star,
  AlertCircle,
  FileText,
  TrendingUp,
  AlertTriangle,
  XCircle,
  LogOut,
  User,
  BarChart2,
  X,
  Menu,
} from "lucide-react";
import NotificationDropdown from "../components/NotificationDropdown.jsx";
import { clearAuth, getUser } from "../utils/authUtils";
import LecturerProfileSettings from "../components/LecturerProfileSettings";
import LecturerMyCircles from "../components/LecturerMyCircles";
import LecturerResourceLibrary from "../components/LecturerResourceLibrary";
import LecturerStudentAnalytics from "../components/LecturerStudentAnalytics";

const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN ||
  `${window.location.protocol}//${window.location.hostname}:5000`;

const resolveImageUrl = (value) => {
  if (!value || typeof value !== "string") return "";
  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  )
    return value;
  if (value.startsWith("/")) return `${API_ORIGIN}${value}`;
  if (value.startsWith("uploads/")) return `${API_ORIGIN}/${value}`;
  if (value.startsWith("profile-")) return `${API_ORIGIN}/uploads/${value}`;
  return value;
};

export default function LecturerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Dashboard Dynamic States
  const [stats, setStats] = useState({
    activeCircles: 0,
    totalSessions: 0,
    topModule: "N/A",
    reportedIssues: 0,
  });
  const [pendingReports, setPendingReports] = useState([]);
  const [topResources, setTopResources] = useState([]);
  const [officeHours, setOfficeHours] = useState([]);
  const [circleMonitor, setCircleMonitor] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [trendsModal, setTrendsModal] = useState(null); // { circleName, engagement, attendance, recentActivity }

  // Auth Effect
  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "lecturer") {
      navigate("/login", { replace: true });
      return;
    }
    setUser(u);
  }, [navigate]);

  const handleLogout = () => {
    clearAuth();
    navigate("/", { replace: true });
  };

  // Dashboard Fetching Effect
  useEffect(() => {
    if (user && activeTab === "dashboard") {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      Promise.all([
        fetch("http://localhost:5000/api/dashboard/stats", { headers }).then(
          (r) => r.json(),
        ),
        fetch("http://localhost:5000/api/reports", { headers }).then((r) =>
          r.json(),
        ),
        fetch("http://localhost:5000/api/lecturer-resources/top", { headers }).then(
          (r) => r.json(),
        ),
        fetch("http://localhost:5000/api/office-hours", { headers }).then((r) =>
          r.json(),
        ),
        fetch("http://localhost:5000/api/lecturer-circles", { headers }).then(
          (r) => r.json(),
        ),
      ])
        .then(
          ([
            statsData,
            reportsData,
            resourcesData,
            officeData,
            circlesData,
          ]) => {
            setStats(statsData);
            if (Array.isArray(reportsData)) setPendingReports(reportsData);
            if (Array.isArray(resourcesData))
              setTopResources(resourcesData.slice(0, 4));
            if (Array.isArray(officeData)) setOfficeHours(officeData);
            if (Array.isArray(circlesData))
              setCircleMonitor(circlesData.slice(0, 4));
          },
        )
        .catch((err) => console.error(err))
        .finally(() => setIsLoading(false));
    }
  }, [user, activeTab]);

  const handleReportAction = async (reportId, status) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:5000/api/reports/${reportId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        },
      );
      if (res.ok) {
        setPendingReports((prev) => prev.filter((r) => r._id !== reportId));
        setStats((prev) => ({
          ...prev,
          reportedIssues: Math.max(0, prev.reportedIssues - 1),
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewTrends = async (circleId) => {
    try {
      const token = localStorage.getItem("token");
      const circle = circleMonitor.find((c) => c._id === circleId) || {};
      const res = await fetch(
        `http://localhost:5000/api/dashboard/analytics/${circleId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      setTrendsModal({
        circleName: circle.circleName || "Circle",
        courseCode: circle.courseCode || "",
        engagement: data.engagementScore ?? 85,
        attendance: data.attendanceRate ?? 92,
        recentActivity: data.recentActivity ?? "High",
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  const handleSelectTab = (tab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  const LecturerSidebar = ({ showClose = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 shrink-0 mt-2 mb-2">
        <div className="flex items-center gap-3 w-full">
          <div className="bg-teal-500 p-2 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-lg text-slate-900 tracking-tight">
            SmartStudy
          </span>
          {showClose ? (
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="ml-auto w-9 h-9 rounded-full hover:bg-slate-100 text-slate-500 inline-flex items-center justify-center"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Main Nav */}
      <div className="flex-1 py-4 flex flex-col">
        <nav className="space-y-1 px-3">
          <button
            type="button"
            onClick={() => handleSelectTab("dashboard")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${activeTab === "dashboard" ? "bg-teal-50 text-teal-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}
          >
            <LayoutDashboard
              className="w-[18px] h-[18px]"
              strokeWidth={2.5}
            />
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => handleSelectTab("circles")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${activeTab === "circles" ? "bg-teal-50 text-teal-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}
          >
            <Users className="w-[18px] h-[18px]" strokeWidth={2} />
            My Circles
          </button>
          <button
            type="button"
            onClick={() => handleSelectTab("library")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${activeTab === "library" ? "bg-teal-50 text-teal-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}
          >
            <BookOpen className="w-[18px] h-[18px]" strokeWidth={2} />
            Resource Library
          </button>
          <button
            type="button"
            onClick={() => handleSelectTab("analytics")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${activeTab === "analytics" ? "bg-teal-50 text-teal-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-teal-600 hover:bg-teal-50 hover:text-teal-700 rounded-lg font-medium text-sm transition-colors"
          >
            <Activity className="w-[18px] h-[18px]" strokeWidth={2} />
            Student Analytics
          </button>
        </nav>

        <div className="mt-8 px-3">
          <p className="px-3 text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">
            MODERATION
          </p>
          <nav className="space-y-1">
            <button
              type="button"
              className="w-full flex items-center justify-between px-3 py-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-lg font-medium text-sm transition-colors"
            >
              <div className="flex items-center gap-3">
                <Flag className="w-[18px] h-[18px]" strokeWidth={2} />
                Reports
              </div>
              <span className="bg-red-50 text-red-500 w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold">
                {pendingReports.length}
              </span>
            </button>
            <button
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-lg font-medium text-sm transition-colors"
            >
              <Gavel className="w-[18px] h-[18px]" strokeWidth={2} />
              Disputes
            </button>
          </nav>
        </div>
      </div>

      {/* Bottom Settings */}
      <div className="p-4 mb-2 shrink-0 border-t border-slate-200 mt-2">
        <button
          type="button"
          onClick={() => handleSelectTab("profile")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors ${activeTab === "profile" ? "bg-teal-50 text-teal-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"} mb-1`}
        >
          <Settings className="w-[18px] h-[18px]" strokeWidth={2} />
          Settings
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg font-medium text-sm transition-colors"
        >
          <LogOut className="w-[18px] h-[18px]" strokeWidth={2} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen lg:h-screen bg-[#F4F7FB] font-sans text-slate-800 overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-none z-20">
        <LecturerSidebar />
      </aside>

      {isSidebarOpen ? (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        >
          <div
            className="absolute left-0 top-0 h-full w-72 bg-white border-r border-slate-200"
            onClick={(event) => event.stopPropagation()}
          >
            <LecturerSidebar showClose />
          </div>
        </div>
      ) : null}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#FAFAFA] md:bg-[#FAFAFA]">
        {/* Header */}
        <header className="h-16 md:h-20 bg-white md:bg-transparent border-b border-transparent md:border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight truncate">
            {activeTab === "dashboard" && "Dashboard Overview"}
            {activeTab === "circles" && "My Study Circles"}
            {activeTab === "library" && "Resource Library"}
            {activeTab === "profile" && "Profile Settings"}
            {activeTab === "analytics" && "Student Analytics Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden lg:block w-72">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                className="bg-slate-100 border-none text-sm rounded-full focus:ring-2 focus:ring-teal-500 block w-full pl-9 pr-4 py-2 text-slate-600 placeholder-slate-400 font-medium"
                placeholder="Search circles or students..."
              />
            </div>

            <div className="flex items-center gap-3">
              <NotificationDropdown />

              <div
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => handleSelectTab("profile")}
                title="Profile Settings"
              >
                <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                  {resolveImageUrl(user.profilePicture || user.avatar || "") ? (
                    <img
                      src={resolveImageUrl(
                        user.profilePicture || user.avatar || "",
                      )}
                      alt="Profile"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <User className="w-5 h-5 text-slate-400 group-hover:scale-105 transition-transform" />
                  )}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-bold text-slate-800 leading-none mb-1">
                    {user.fullName}
                  </p>
                  <p className="text-xs text-slate-500 font-semibold">
                    {user.designation ||
                      (user.role === "lecturer" ? "Lecturer" : user.role)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activeTab === "dashboard" ? (
            <div className="max-w-[1400px] mx-auto">
              {/* Welcome Title */}
              <div className="mb-8 mt-2">
                <h2 className="text-2xl font-bold text-slate-900 mb-1">
                  Welcome back, {user.fullName}
                </h2>
                <p className="text-slate-500 text-sm font-medium">
                  Here's what's happening in your study circles today.
                </p>
              </div>

              {/* Loading State */}
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
                </div>
              ) : (
                <>
                  {/* 4 Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                    {/* Active Circles */}
                    <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-[13px] font-semibold text-slate-500 mb-3">
                            Active Circles
                          </h3>
                          <div className="text-3xl font-extrabold text-slate-800">
                            {stats.activeCircles}
                          </div>
                        </div>
                        <div className="w-[42px] h-[42px] rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                          <Users className="w-[20px] h-[20px]" />
                        </div>
                      </div>
                      <div className="pt-2 flex items-center gap-1.5 text-xs">
                        <span className="text-emerald-500 font-bold flex items-center">
                          <TrendingUp className="w-3.5 h-3.5 mr-1" /> Active
                        </span>
                        <span className="text-slate-400 font-medium">
                          study groups
                        </span>
                      </div>
                    </div>

                    {/* Total Sessions */}
                    <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-[13px] font-semibold text-slate-500 mb-3">
                            Total Sessions
                          </h3>
                          <div className="text-3xl font-extrabold text-slate-800">
                            {stats.totalSessions}
                          </div>
                        </div>
                        <div className="w-[42px] h-[42px] rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                          <Clock className="w-[20px] h-[20px]" />
                        </div>
                      </div>
                      <div className="pt-2 text-xs font-medium text-slate-500 leading-snug">
                        Total hours logged
                        <br />
                        across all circles
                      </div>
                    </div>

                    {/* Top Module */}
                    <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col space-y-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-[13px] font-semibold text-slate-500 mb-3">
                            Top Module
                          </h3>
                          <div className="text-[17px] font-bold text-slate-800 tracking-tight leading-tight max-w-[120px]">
                            {stats.topModule}
                          </div>
                        </div>
                        <div className="w-[42px] h-[42px] rounded-xl bg-purple-50 flex items-center justify-center">
                          <Star className="w-[20px] h-[20px] text-purple-600 fill-purple-600" />
                        </div>
                      </div>
                      <div className="pt-1">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-slate-100 rounded-full h-1.5">
                            <div
                              className="bg-purple-500 h-1.5 rounded-full"
                              style={{ width: "85%" }}
                            ></div>
                          </div>
                          <span className="text-xs font-bold text-purple-600">
                            85%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Reported Issues */}
                    <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-[13px] font-semibold text-red-500 mb-3">
                            Reported Issues
                          </h3>
                          <div className="text-3xl font-extrabold text-slate-800">
                            {stats.reportedIssues}
                          </div>
                        </div>
                        <div className="w-[42px] h-[42px] rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                          <AlertTriangle
                            className="w-[20px] h-[20px]"
                            strokeWidth={2.5}
                          />
                        </div>
                      </div>
                      <div className="pt-2 text-xs font-bold text-red-500 mt-auto">
                        Action Required
                      </div>
                    </div>
                  </div>

                  {/* Bottom Section (2 Columns) */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content Area (Left 2 cols) */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Circle Activity Monitor */}
                      <div className="bg-white rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
                        <div className="p-6 flex items-center justify-between">
                          <h3 className="text-[15px] font-bold text-slate-800">
                            Circle Activity Monitor
                          </h3>
                          <a
                            href="#"
                            className="text-sm font-bold text-teal-600 hover:text-teal-700"
                          >
                            View All
                          </a>
                        </div>
                        <div className="px-6 pb-6 overflow-x-auto">
                          <table className="w-full text-left min-w-[680px]">
                            <thead>
                              <tr className="border-b border-slate-100">
                                <th className="pb-3 text-[13px] font-semibold text-slate-500 whitespace-nowrap">
                                  Circle Name
                                </th>
                                <th className="pb-3 text-[13px] font-semibold text-slate-500 whitespace-nowrap">
                                  Module
                                </th>
                                <th className="pb-3 text-[13px] font-semibold text-slate-500 whitespace-nowrap">
                                  Members
                                </th>
                                <th className="pb-3 text-[13px] font-semibold text-slate-500 whitespace-nowrap">
                                  Last Activity
                                </th>
                                <th className="pb-3 text-[13px] font-semibold text-slate-500 text-center whitespace-nowrap">
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {circleMonitor.length > 0 ? (
                                circleMonitor.map((circle) => (
                                  <tr
                                    key={circle._id}
                                    className="border-b border-slate-50 group hover:bg-slate-50/50 transition-colors"
                                  >
                                    <td className="py-4 text-[14px] font-bold text-slate-800 pr-4">
                                      {circle.circleName}
                                    </td>
                                    <td className="py-4 text-[13px] font-medium text-slate-500 pr-4">
                                      {circle.courseName}
                                    </td>
                                    <td className="py-4 pr-4">
                                      <div className="flex -space-x-2">
                                        <div className="w-7 h-7 rounded-full border-2 border-white bg-teal-100 text-[10px] font-bold text-teal-600 flex items-center justify-center">
                                          {circle.members?.length || 0}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-4 text-[13px] font-medium text-slate-500 pr-4">
                                      {circle.lastActivity || "Active"}
                                    </td>
                                    <td className="py-4 text-center">
                                      <button
                                        onClick={() =>
                                          handleViewTrends(circle._id)
                                        }
                                        className="px-4 py-1.5 border border-teal-100 text-teal-600 rounded-lg text-xs font-bold hover:bg-teal-50 transition-colors"
                                      >
                                        View Trends
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan="5"
                                    className="py-8 text-center text-[13px] font-bold text-slate-400"
                                  >
                                    No active circles found
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Top Resources */}
                      <div className="bg-white rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-[15px] font-bold text-slate-800">
                            Top Resources
                          </h3>
                          <button
                            onClick={() => handleSelectTab("library")}
                            className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg text-[13px] font-bold transition-colors"
                          >
                            Upload Resource
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {topResources.length > 0 ? (
                            topResources.map((res) => (
                              <div
                                key={res._id}
                                className="border border-slate-100 rounded-xl p-4 flex items-center justify-between shadow-sm"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-[38px] h-[38px] rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                                    <FileText
                                      strokeWidth={2.5}
                                      className="w-[20px] h-[20px] text-red-500"
                                    />
                                  </div>
                                  <div>
                                    <h4 className="text-[13px] font-bold text-slate-800 mb-0.5 max-w-[130px] truncate">
                                      {res.title}
                                    </h4>
                                    <p className="text-[11px] text-slate-500 font-medium">
                                      {res.downloads || 0} Downloads
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                  <span className="text-[13px] font-bold text-slate-600">
                                    {res.rating || "New"}
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-2 text-center py-8 text-[13px] font-bold text-slate-400">
                              No resources uploaded yet
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Sidebar Content (Right 1 col) */}
                    <div className="space-y-6">
                      {/* Pending Reports */}
                      <div className="bg-white rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-5">
                          <h3 className="text-[15px] font-bold text-slate-800">
                            Pending Reports
                          </h3>
                          <span className="bg-red-50 text-red-500 px-2 py-1 rounded-[6px] text-[10px] font-bold tracking-wide">
                            {pendingReports.length} New
                          </span>
                        </div>

                        <div className="space-y-3">
                          {pendingReports.length > 0 ? (
                            pendingReports.map((rep) => (
                              <div
                                key={rep._id}
                                className="bg-[#FCFCFD] border border-slate-100 rounded-[14px] p-4 shadow-sm"
                              >
                                <div className="flex items-start gap-3 mb-4">
                                  <div className="w-[28px] h-[28px] rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <AlertTriangle
                                      className="w-[14px] h-[14px] text-orange-500"
                                      strokeWidth={3}
                                    />
                                  </div>
                                  <div>
                                    <h4 className="text-[13px] font-bold text-slate-800 mb-0.5 leading-tight">
                                      {rep.title}
                                    </h4>
                                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                      {rep.description ||
                                        "Action required from moderation dashboard"}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() =>
                                      handleReportAction(rep._id, "Reviewed")
                                    }
                                    className="flex-1 bg-white border border-slate-200 text-slate-700 py-1.5 rounded-[8px] text-[12px] font-bold hover:bg-slate-50 transition-colors"
                                  >
                                    Review
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleReportAction(rep._id, "Dismissed")
                                    }
                                    className="flex-1 bg-white border border-slate-200 text-slate-700 py-1.5 rounded-[8px] text-[12px] font-bold hover:bg-slate-50 transition-colors"
                                  >
                                    Dismiss
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleReportAction(rep._id, "Resolved")
                                    }
                                    className="flex-1 bg-teal-500 text-white py-1.5 rounded-[8px] text-[12px] font-bold hover:bg-teal-600 transition-colors"
                                  >
                                    Resolve
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-6 text-[13px] font-bold text-slate-400">
                              No pending reports ✓
                            </div>
                          )}
                        </div>

                        <div className="text-center mt-5">
                          <a
                            href="#"
                            className="text-[12px] font-bold text-slate-500 hover:text-slate-800 transition-colors"
                          >
                            View all reports
                          </a>
                        </div>
                      </div>

                      {/* Upcoming Office Hours */}
                      <div className="bg-white rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-4 sm:p-6">
                        <h3 className="text-[15px] font-bold text-slate-800 mb-5">
                          Upcoming Office Hours
                        </h3>

                        <div className="space-y-4">
                          {officeHours.length > 0 ? (
                            officeHours.map((hour) => {
                              const d = new Date(hour.date);
                              return (
                                <div
                                  key={hour._id}
                                  className="flex gap-4 items-center"
                                >
                                  <div className="w-[46px] h-[48px] bg-[#FAFAFA] rounded-[12px] border border-slate-100 flex flex-col items-center justify-center flex-shrink-0 shadow-sm">
                                    <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">
                                      {d.toLocaleString("default", {
                                        month: "short",
                                      })}
                                    </span>
                                    <span className="text-[16px] font-extrabold text-slate-800 leading-tight">
                                      {d.getDate()}
                                    </span>
                                  </div>
                                  <div>
                                    <h4 className="text-[13px] font-bold text-slate-800 mb-0.5">
                                      {hour.title}
                                    </h4>
                                    <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                                      {hour.startTime} - {hour.endTime}
                                    </p>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-center py-4 text-[13px] font-bold text-slate-400">
                              No upcoming office hours
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : activeTab === "profile" ? (
            <LecturerProfileSettings user={user} />
          ) : activeTab === "circles" ? (
            <LecturerMyCircles user={user} />
          ) : activeTab === "library" ? (
            <LecturerResourceLibrary />
          ) : activeTab === "analytics" ? (
            <LecturerStudentAnalytics user={user} />
          ) : null}
        </div>
      </main>

      {/* ── Trends Modal ── */}
      {trendsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
          onClick={() => setTrendsModal(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-5 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <BarChart2 className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-teal-100 text-[11px] font-bold uppercase tracking-widest">Circle Analytics</p>
                  <h3 className="text-white font-bold text-lg leading-tight">{trendsModal.circleName}</h3>
                  {trendsModal.courseCode && (
                    <p className="text-teal-200 text-[12px] font-semibold">{trendsModal.courseCode}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setTrendsModal(null)}
                className="text-white/70 hover:text-white mt-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Engagement */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] font-bold text-slate-700">Engagement Score</span>
                  <span className="text-[13px] font-extrabold text-teal-600">{trendsModal.engagement}%</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all duration-700"
                    style={{ width: `${trendsModal.engagement}%` }}
                  />
                </div>
              </div>

              {/* Attendance */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] font-bold text-slate-700">Attendance Rate</span>
                  <span className="text-[13px] font-extrabold text-blue-600">{trendsModal.attendance}%</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-700"
                    style={{ width: `${trendsModal.attendance}%` }}
                  />
                </div>
              </div>

              {/* Recent Activity Badge */}
              <div className="flex items-center justify-between bg-slate-50 rounded-2xl px-4 py-3.5 border border-slate-100">
                <span className="text-[13px] font-bold text-slate-700">Recent Activity</span>
                <span
                  className={`px-3 py-1 rounded-full text-[12px] font-extrabold ${
                    trendsModal.recentActivity?.toLowerCase() === 'high'
                      ? 'bg-emerald-100 text-emerald-700'
                      : trendsModal.recentActivity?.toLowerCase() === 'moderate'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {trendsModal.recentActivity}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6">
              <button
                onClick={() => setTrendsModal(null)}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl text-[14px] transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
