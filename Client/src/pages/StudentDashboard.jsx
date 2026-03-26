import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  LayoutDashboard,
  Users,
  FolderOpen,
  Calendar,
  TrendingUp,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Plus,
  Star,
  Upload,
  Lock,
  GraduationCap,
  X,
  Mail,
} from "lucide-react";
import { clearAuth, getUser } from "../utils/authUtils";
import StudentProgress from "../components/StudentProgress";
import StudentCirclesManager from "../components/StudentCirclesManager";
import ResourcesLibrary from "../components/ResourcesLibrary";
const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN ||
  `${window.location.protocol}//${window.location.hostname}:5000`;
const CIRCLES_API_BASE = `${API_ORIGIN}/api/circles`;
const USERS_API_BASE = `${API_ORIGIN}/api/users`;
const RESOURCES_API_BASE = `${API_ORIGIN}/api/resources`;

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

const getAuthHeaders = () => {
  const token = (localStorage.getItem("token") || "").replace(/[\r\n"]/g, "");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

/* ── COMPONENTS ── */

const Sidebar = ({ currentView, setCurrentView, handleLogout }) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "circles", label: "Study Circles", icon: Users },
    { id: "resources", label: "Resources", icon: FolderOpen },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "progress", label: "Progress", icon: TrendingUp },
  ];

  return (
    <div className="w-64 bg-white h-screen border-r border-gray-100 hidden md:flex md:flex-col shrink-0">
      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-gray-50">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
          <GraduationCap className="text-white w-5 h-5" />
        </div>
        <span className="text-xl font-bold text-gray-900 tracking-tight">
          SmartStudy
        </span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-6 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            currentView === item.id ||
            (currentView === "profile" && item.id === "dashboard");
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon
                className={`w-5 h-5 mr-3 ${isActive ? "text-blue-600" : "text-gray-400"}`}
              />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Premium Banner */}
      <div className="p-4">
        <div className="bg-blue-500 rounded-2xl p-5 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h4 className="font-bold text-sm mb-1">Premium Plan</h4>
            <p className="text-blue-100 text-xs mb-3">
              Get unlimited AI summaries.
            </p>
            <button className="bg-white/20 hover:bg-white/30 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-colors">
              Upgrade
            </button>
          </div>
          <Star className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10" />
        </div>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-gray-50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 text-sm font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

const TopBar = ({ user, currentView, setCurrentView }) => {
  const resolvedAvatar = resolveImageUrl(
    user?.avatar || user?.profilePicture || "",
  );

  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0">
      {/* Search */}
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search for notes, modules, or circles..."
            className="w-full bg-gray-50 border-none rounded-full py-2.5 pl-10 pr-4 text-sm text-gray-700 focus:ring-2 focus:ring-blue-100 focus:outline-none placeholder-gray-400"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-6 ml-4">
        <button className="relative text-gray-400 hover:text-gray-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <button
          onClick={() => setCurrentView("profile")}
          className="flex items-center gap-3 text-left group"
        >
          <div className="hidden md:block text-right">
            <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {user?.fullName || "Student User"}
            </p>
            <p className="text-xs text-gray-500">
              {user?.department || "Computer Science"}
            </p>
          </div>
          <div
            className={`w-10 h-10 rounded-full ${user?.avatar ? "bg-white" : "bg-orange-100"} border-2 border-white shadow-sm overflow-hidden flex-shrink-0`}
          >
            <img
              src={
                resolvedAvatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || "student"}`
              }
              alt="Avatar"
              className={`w-full h-full object-cover ${resolvedAvatar ? "" : "pt-1"}`}
            />
          </div>
        </button>
      </div>
    </header>
  );
};

const DashboardOverview = ({
  user,
  myCircles = [],
  isCirclesLoading = false,
  setCurrentView,
  recentResources = [],
  isResourcesLoading = false,
  savedResourcesCount = 0,
  onPreviewResource,
}) => {
  const dashboardCircles = myCircles.slice(0, 3);
  const stats = [
    {
      label: "Joined Circles",
      value: String(myCircles.length),
      badge: myCircles.length > 0 ? `${myCircles.length} total` : null,
      badgeColor: "text-emerald-600 bg-emerald-50",
      icon: Users,
      color: "text-blue-500 bg-blue-50",
    },
    {
      label: "Study Time (This Week)",
      value: "12h",
      badge: null,
      icon: Calendar,
      color: "text-purple-500 bg-purple-50",
    },
    {
      label: "Saved Resources",
      value: String(savedResourcesCount),
      badge: null,
      icon: FolderOpen,
      color: "text-orange-500 bg-orange-50",
    },
    {
      label: "Engagement Score",
      value: "85%",
      badge: "Top 10%",
      badgeColor: "text-blue-600 bg-blue-50",
      icon: TrendingUp,
      color: "text-emerald-500 bg-emerald-50",
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0f172a] tracking-tight mb-2">
              Dashboard Overview
            </h1>
            <p className="text-gray-500">
              Welcome back, {(user?.fullName || "Student User").split(" ")[0]}!
              You have 3 upcoming sessions this week.
            </p>
          </div>
          <button className="bg-blue-50 text-blue-600 font-semibold px-4 py-2.5 rounded-xl text-sm flex items-center hover:bg-blue-100 transition-colors">
            <Calendar className="w-4 h-4 mr-2" />
            October 24, 2023
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between h-36"
            >
              <div className="flex justify-between items-start">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}
                >
                  <stat.icon className="w-5 h-5" />
                </div>
                {stat.badge && (
                  <span
                    className={`px-2 py-1 rounded-lg text-xs font-bold ${stat.badgeColor}`}
                  >
                    {stat.badge}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </h3>
                <p className="text-sm font-medium text-gray-500 mt-1">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Grid Setup */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column (Circles & Resources) */}
          <div className="xl:col-span-2 space-y-8">
            {/* Study Circles */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">
                  My Study Circles
                </h2>
                <button
                  type="button"
                  onClick={() => setCurrentView("circles")}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  View All
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isCirclesLoading ? (
                  <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-sm text-gray-500">
                    Loading your circles...
                  </div>
                ) : dashboardCircles.length === 0 ? (
                  <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-sm text-gray-500">
                    No study circles yet. Join or create one from the Study
                    Circles tab.
                  </div>
                ) : (
                  dashboardCircles.map((circle, idx) => {
                    const accent =
                      idx % 3 === 0
                        ? "bg-blue-500"
                        : idx % 3 === 1
                          ? "bg-purple-500"
                          : "bg-orange-500";
                    const moduleBadge =
                      idx % 3 === 0
                        ? "bg-blue-50 text-blue-600"
                        : idx % 3 === 1
                          ? "bg-purple-50 text-purple-600"
                          : "bg-orange-50 text-orange-600";

                    return (
                      <div
                        key={circle.id}
                        className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group transition-colors hover:border-blue-200"
                      >
                        <div
                          className={`absolute top-0 left-0 w-1 h-full ${accent}`}
                        />
                        <div className="flex justify-between items-start mb-3">
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded-lg ${moduleBadge}`}
                          >
                            {circle.moduleCode}
                          </span>
                          <span className="text-xs font-bold text-gray-400">
                            {circle.visibility}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition-colors">
                          {circle.subject}
                        </h3>
                        <p className="text-sm text-gray-500 mb-6 line-clamp-2">
                          {circle.semester} • Year {circle.year}
                        </p>
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-500 font-semibold">
                            {circle.memberCount ?? 0} members
                          </div>
                          <button
                            type="button"
                            onClick={() => setCurrentView("circles")}
                            className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 flex items-center justify-center transition-colors"
                            aria-label="Open circles"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Join New */}
                <button
                  type="button"
                  onClick={() => setCurrentView("circles")}
                  className="bg-transparent border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                    <Plus className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                  </div>
                  <h3 className="font-bold text-gray-700 group-hover:text-blue-700">
                    Join New Circle
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Discover groups for your modules
                  </p>
                </button>
              </div>
            </section>

            {/* Recent Resources */}
            <section>
              <div className="flex items-center justify-between mb-4 mt-6">
                <h2 className="text-lg font-bold text-gray-900">
                  Recent Resources
                </h2>
                <button
                  type="button"
                  onClick={() => setCurrentView("resources")}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Browse Library
                </button>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Views
                      </th>
                      <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {isResourcesLoading ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-6 px-6 text-sm text-gray-500"
                        >
                          Loading recent resources...
                        </td>
                      </tr>
                    ) : recentResources.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-6 px-6 text-sm text-gray-500"
                        >
                          No resources available yet.
                        </td>
                      </tr>
                    ) : (
                      recentResources.map((resource) => (
                        <tr
                          key={resource._id || resource.id}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                                <span className="text-[10px] font-bold uppercase">
                                  {String(resource.type || "file").slice(0, 3)}
                                </span>
                              </div>
                              <span className="text-sm font-bold text-gray-900 line-clamp-1">
                                {resource.title}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-slate-100 text-slate-700 uppercase">
                              {resource.type || "file"}
                            </span>
                          </td>
                          <td className="py-4 px-6 hidden sm:table-cell text-xs font-bold text-gray-600">
                            {resource.views || 0}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              type="button"
                              onClick={() => onPreviewResource?.(resource)}
                              className="text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <ChevronRight className="w-5 h-5 ml-auto" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Right Column (Sessions & Calendar) */}
          <div className="space-y-8">
            {/* Upcoming Sessions */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                Upcoming Sessions
              </h2>

              <div className="relative border-l-2 border-gray-100 ml-3 space-y-8 pb-4">
                {/* Session 1 */}
                <div className="relative pl-6">
                  <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-white bg-blue-500 shadow-sm"></span>
                  <p className="text-xs font-bold text-blue-500 mb-1">
                    TODAY, 14:00
                  </p>
                  <h4 className="text-sm font-bold text-gray-900 mb-1">
                    CS101 Group Study
                  </h4>
                  <p className="text-xs text-gray-500 mb-3">
                    Virtual • Zoom Link
                  </p>
                  <button className="bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold py-1.5 px-3 rounded-lg transition-colors">
                    Join Meeting
                  </button>
                </div>

                {/* Session 2 */}
                <div className="relative pl-6">
                  <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-white bg-gray-300 shadow-sm"></span>
                  <p className="text-xs font-bold text-gray-500 mb-1">
                    TOMORROW, 10:00
                  </p>
                  <h4 className="text-sm font-bold text-gray-900 mb-1">
                    Exam Prep: History
                  </h4>
                  <p className="text-xs text-gray-500">Library Room 302</p>
                </div>

                {/* Session 3 */}
                <div className="relative pl-6">
                  <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-white bg-gray-300 shadow-sm"></span>
                  <p className="text-xs font-bold text-gray-500 mb-1">
                    FRI, 13:00
                  </p>
                  <h4 className="text-sm font-bold text-gray-900 mb-1">
                    Eco Policy Review
                  </h4>
                  <p className="text-xs text-gray-500">Campus Cafe</p>
                </div>
              </div>
            </div>

            {/* Calendar Widget placeholder */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">October 2023</h3>
                <div className="flex gap-2">
                  <button className="text-gray-400 hover:text-gray-600">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="text-gray-400 hover:text-gray-600">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 text-center gap-1 mb-2">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                  <div key={i} className="text-xs font-bold text-gray-400 py-1">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 text-center gap-1">
                {/* Dummy calendar dates */}
                {Array.from({ length: 31 }, (_, i) => {
                  const day = i + 1;
                  const isToday = day === 24;
                  return (
                    <div key={i} className="py-1">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 text-xs font-semibold rounded-full ${isToday ? "bg-blue-500 text-white shadow-md" : "text-gray-700 hover:bg-gray-100"}`}
                      >
                        {day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col items-end gap-3 z-50">
        <div className="bg-white rounded-2xl shadow-xl w-48 text-sm overflow-hidden border border-gray-100 opacity-90 hover:opacity-100 transition-opacity hidden md:block">
          <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-50">
            <span className="text-amber-500">✨</span> Summarize notes
          </button>
          <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2">
            <span className="text-blue-500">📝</span> Quiz me on History
          </button>
        </div>
        <button className="w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105">
          <GraduationCap className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

const EditProfile = ({ user, setUser }) => {
  const fileInputRef = React.useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isPhotoRemoved, setIsPhotoRemoved] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    displayName:
      user?.displayName || (user?.fullName || "Student User").split(" ")[0],
    department: user?.department || "",
    universityEmail: user?.universityEmail || user?.email || "",
    bio: user?.bio || "",
    emailAlerts: user?.emailAlerts ?? true,
    pushNotifications: user?.pushNotifications ?? false,
    avatar: user?.avatar || user?.profilePicture || "",
  });

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File size exceeds 2MB limit.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
      setSelectedPhoto(file);
      setIsPhotoRemoved(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const storedToken = localStorage.getItem("token") || "";
      const cleanToken = storedToken.replace(/[\r\n"]/g, ""); // Ensure no invalid header chars

      let photoData = null;

      if (selectedPhoto) {
        const uploadBody = new FormData();
        uploadBody.append("image", selectedPhoto);

        const uploadRes = await fetch(`${USERS_API_BASE}/profile/photo`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${cleanToken}`,
          },
          body: uploadBody,
        });

        const uploadRawText = await uploadRes.text();
        try {
          photoData = uploadRawText ? JSON.parse(uploadRawText) : {};
        } catch {
          photoData = {};
        }

        if (!uploadRes.ok) {
          throw new Error(photoData.message || "Error uploading profile photo");
        }
      } else if (isPhotoRemoved && (user?.profilePicture || user?.avatar)) {
        const removeRes = await fetch(`${USERS_API_BASE}/profile/photo`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${cleanToken}`,
          },
        });

        if (!removeRes.ok) {
          const removeData = await removeRes.json().catch(() => ({}));
          throw new Error(removeData.message || "Error removing profile photo");
        }
      }

      const { avatar, emailAlerts, pushNotifications, ...profilePayload } =
        formData;

      const res = await fetch(`${USERS_API_BASE}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cleanToken}`,
        },
        body: JSON.stringify(profilePayload),
      });

      const rawText = await res.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (parseErr) {
        throw new Error(
          res.ok
            ? "Failed to parse successful response."
            : "Payload too large or server error.",
        );
      }

      if (!res.ok) throw new Error(data.message || "Error updating profile");

      const nextUser = {
        ...data,
        avatar: photoData?.avatar ?? data.avatar,
        profilePicture: photoData?.profilePicture ?? data.profilePicture,
      };

      setUser(nextUser);
      localStorage.setItem("user", JSON.stringify(nextUser));
      setSelectedPhoto(null);
      setIsPhotoRemoved(false);
      setFormData((prev) => ({
        ...prev,
        avatar: nextUser.avatar || nextUser.profilePicture || "",
      }));
      alert("Profile saved successfully!");
    } catch (err) {
      console.error("Save Error:", err);
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#0f172a] tracking-tight mb-2">
            Edit Profile
          </h1>
          <p className="text-gray-500">
            Manage your account settings and preferences.
          </p>
        </div>

        {/* Avatar Section */}
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div
            className={`w-24 h-24 rounded-full ${formData.avatar ? "bg-white" : "bg-orange-100"} overflow-hidden ring-4 ring-white shadow-md flex-shrink-0`}
          >
            <img
              src={
                resolveImageUrl(formData.avatar) ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || "student"}`
              }
              alt="Profile"
              className={`w-full h-full object-cover ${formData.avatar ? "" : "pt-2"}`}
            />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {formData.fullName || "Student User"}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {user?.email || "student@university.edu"}
            </p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-3">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handlePhotoUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-sm font-semibold py-2 px-4 rounded-xl inline-flex items-center transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" /> Upload New Photo
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, avatar: "" }));
                  setSelectedPhoto(null);
                  setIsPhotoRemoved(true);
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2 px-4 rounded-xl transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>

        {/* Form Details */}
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-fuchsia-100 text-fuchsia-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Account Details</h2>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-fuchsia-100 focus:border-fuchsia-400 outline-none transition-all placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-fuchsia-100 focus:border-fuchsia-400 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g. Computer Science"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-fuchsia-100 focus:border-fuchsia-400 outline-none transition-all placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  University Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="universityEmail"
                    value={formData.universityEmail}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-fuchsia-100 focus:border-fuchsia-400 outline-none transition-all placeholder-gray-400"
                  />
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                rows="3"
                value={formData.bio}
                onChange={handleChange}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-fuchsia-100 focus:border-fuchsia-400 outline-none transition-all resize-none"
              ></textarea>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className={`bg-fuchsia-600 text-white text-sm font-bold py-3 px-6 rounded-xl transition-colors shadow-sm shadow-fuchsia-200 ${isSaving ? "opacity-70 cursor-not-allowed" : "hover:bg-fuchsia-700"}`}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-fuchsia-100 text-fuchsia-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              Notification Preferences
            </h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-1">
                  <Mail className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">
                    Email Alerts
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Receive weekly summaries and important course updates via
                    email.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    emailAlerts: !prev.emailAlerts,
                  }))
                }
                className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${formData.emailAlerts ? "bg-fuchsia-600" : "bg-gray-200"}`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${formData.emailAlerts ? "translate-x-7" : "translate-x-1"}`}
                ></div>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bell className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">
                    Push Notifications
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Get instant alerts for grade changes, schedule updates, and
                    messages.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    pushNotifications: !prev.pushNotifications,
                  }))
                }
                className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${formData.pushNotifications ? "bg-fuchsia-600" : "bg-gray-200"}`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${formData.pushNotifications ? "translate-x-7" : "translate-x-1"}`}
                ></div>
              </button>
            </div>
          </div>
        </div>

        {/* Deactivate Box */}
        <div className="bg-red-50/50 rounded-2xl p-6 border border-red-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-red-900 text-sm">
              Deactivate Account
            </h3>
            <p className="text-xs text-red-600/80 mt-1">
              Temporarily disable your student profile. This action can be
              undone.
            </p>
          </div>
          <button className="bg-transparent border-2 border-red-200 text-red-600 font-bold py-2 px-6 rounded-xl text-sm hover:bg-red-50 transition-colors whitespace-nowrap">
            Deactivate
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── MAIN LAYOUT PAGE ── */

export default function StudentDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState("dashboard");
  const [myCircles, setMyCircles] = useState([]);
  const [discoverCircles, setDiscoverCircles] = useState([]);
  const [isCirclesLoading, setIsCirclesLoading] = useState(false);
  const [hasLoadedDiscover, setHasLoadedDiscover] = useState(false);
  const [recentResources, setRecentResources] = useState([]);
  const [savedResourcesCount, setSavedResourcesCount] = useState(0);
  const [isResourcesLoading, setIsResourcesLoading] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "student") {
      navigate("/login", { replace: true });
      return;
    }
    setUser(u);
  }, [navigate]);

  const refreshCircles = async (silent = false, options = {}) => {
    const includeDiscover = options.includeDiscover ?? false;

    if (!silent) setIsCirclesLoading(true);

    try {
      const requests = [
        fetch(`${CIRCLES_API_BASE}/my`, { headers: getAuthHeaders() }),
      ];

      if (includeDiscover) {
        requests.push(
          fetch(`${CIRCLES_API_BASE}/discover`, { headers: getAuthHeaders() }),
        );
      }

      const [myRes, discoverRes] = await Promise.all(requests);

      if (myRes.status === 401 || discoverRes?.status === 401) {
        clearAuth();
        navigate("/login", { replace: true });
        return;
      }

      const myData = await myRes.json();

      if (!myRes.ok)
        throw new Error(myData.message || "Failed to load your circles.");

      setMyCircles(Array.isArray(myData.circles) ? myData.circles : []);

      if (includeDiscover && discoverRes) {
        const discoverData = await discoverRes.json();
        if (!discoverRes.ok)
          throw new Error(
            discoverData.message || "Failed to load discover circles.",
          );
        setDiscoverCircles(
          Array.isArray(discoverData.circles) ? discoverData.circles : [],
        );
        setHasLoadedDiscover(true);
      }
    } catch (err) {
      console.error("Failed to refresh circles:", err);
    } finally {
      setIsCirclesLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    refreshCircles(false, { includeDiscover: false });
  }, [user]);

  const refreshOverviewResources = async () => {
    setIsResourcesLoading(true);
    try {
      const res = await fetch(
        `${RESOURCES_API_BASE}?sort=-createdAt&limit=5&page=1`,
        { headers: getAuthHeaders() },
      );

      if (res.status === 401) {
        clearAuth();
        navigate("/login", { replace: true });
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load resources.");

      const list = Array.isArray(data.resources) ? data.resources : [];
      setRecentResources(list);
      setSavedResourcesCount(Number(data?.pagination?.total || 0));
    } catch (err) {
      console.error("Failed to load overview resources:", err);
      setRecentResources([]);
      setSavedResourcesCount(0);
    } finally {
      setIsResourcesLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    refreshOverviewResources();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (currentView !== "circles") return;
    if (hasLoadedDiscover) return;
    refreshCircles(false, { includeDiscover: true });
  }, [currentView, user, hasLoadedDiscover]);

  useEffect(() => {
    const view = new URLSearchParams(location.search).get("view");
    const allowed = [
      "dashboard",
      "circles",
      "resources",
      "calendar",
      "progress",
      "profile",
    ];
    if (view && allowed.includes(view)) {
      setCurrentView(view);
    }
  }, [location.search]);

  const handleLogout = () => {
    clearAuth();
    navigate("/", { replace: true });
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        handleLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          user={user}
          currentView={currentView}
          setCurrentView={setCurrentView}
        />

        {currentView === "dashboard" ? (
          <DashboardOverview
            user={user}
            myCircles={myCircles}
            isCirclesLoading={isCirclesLoading}
            setCurrentView={setCurrentView}
            recentResources={recentResources}
            isResourcesLoading={isResourcesLoading}
            savedResourcesCount={savedResourcesCount}
            onPreviewResource={(resource) =>
              navigate(`/resources/preview/${resource._id || resource.id}`)
            }
          />
        ) : currentView === "circles" ? (
          <div className="flex-1 overflow-y-auto bg-gray-50/50 p-8">
            <div className="max-w-7xl mx-auto">
              <StudentCirclesManager
                user={user}
                myCircles={myCircles}
                discoverCircles={discoverCircles}
                refreshCircles={(silent) =>
                  refreshCircles(silent, { includeDiscover: true })
                }
                isLoadingExternal={isCirclesLoading}
              />
            </div>
          </div>
        ) : currentView === "resources" ? (
          <ResourcesLibrary user={user} />
        ) : currentView === "progress" ? (
          <StudentProgress user={user} role="student" />
        ) : currentView === "profile" ? (
          <EditProfile user={user} setUser={setUser} />
        ) : (
          <div className="flex-1 overflow-y-auto bg-gray-50/50 p-8 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 text-lg">
                This section is coming soon.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
