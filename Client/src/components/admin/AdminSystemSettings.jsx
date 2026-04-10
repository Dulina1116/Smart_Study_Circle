import { useEffect, useState } from "react";
import {
  Calendar,
  Camera,
  HardDrive,
  Shield,
  Bell,
  CheckCircle2,
  Upload,
  Trash2,
} from "lucide-react";
import { getUser } from "../../utils/authUtils";

const STORAGE_KEY = "adminSettings";

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
  ) {
    return value;
  }
  if (value.startsWith("/")) return `${API_ORIGIN}${value}`;
  if (value.startsWith("uploads/")) return `${API_ORIGIN}/${value}`;
  if (value.startsWith("profile-")) return `${API_ORIGIN}/uploads/${value}`;
  return value;
};

const defaultSettings = {
  semesterStart: "2024-09-01",
  semesterEnd: "2025-01-15",
  semesterActive: true,
  maxFileSizeMb: 50,
  allowedTypes: {
    pdf: true,
    docx: true,
    pptx: true,
    zip: false,
  },
  permissions: {
    studentCircleCreation: true,
    directMessaging: true,
    publicProfile: false,
  },
  alertFrequency: "Daily Summary",
};

export default function AdminSystemSettings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [saveMessage, setSaveMessage] = useState("");
  const [storageUsed, setStorageUsed] = useState(750); // GB
  const [storageTotal, setStorageTotal] = useState(1000); // GB (1 TB)
  const [cleanupMessage, setCleanupMessage] = useState("");
  const [profileUser, setProfileUser] = useState(() => getUser());
  const [profilePreview, setProfilePreview] = useState(() =>
    resolveImageUrl(getUser()?.profilePicture || getUser()?.avatar || ""),
  );
  const [profileError, setProfileError] = useState("");
  const [profileNotice, setProfileNotice] = useState("");
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setSettings((prev) => ({ ...prev, ...parsed }));
      } catch {
        // Ignore invalid storage entries
      }
    }

    const currentUser = getUser();
    setProfileUser(currentUser);
    setProfilePreview(
      resolveImageUrl(currentUser?.profilePicture || currentUser?.avatar || ""),
    );
  }, []);

  useEffect(() => {
    const handler = () => {
      const currentUser = getUser();
      setProfileUser(currentUser);
      setProfilePreview(
        resolveImageUrl(
          currentUser?.profilePicture || currentUser?.avatar || "",
        ),
      );
    };
    window.addEventListener("profile:updated", handler);
    return () => window.removeEventListener("profile:updated", handler);
  }, []);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaveMessage("Settings saved.");
    setTimeout(() => setSaveMessage(""), 2000);
  };

  const handleCleanUp = () => {
    const newUsed = Math.max(0, storageUsed - 150); // Free up 150 GB
    setStorageUsed(newUsed);
    setCleanupMessage("Cleanup completed. Freed 150 GB.");
    setTimeout(() => setCleanupMessage(""), 3000);
  };

  const handleUpgradePlan = () => {
    setStorageTotal(2000); // Upgrade to 2 TB
    setSaveMessage("Plan upgraded to 2 TB storage!");
    setTimeout(() => setSaveMessage(""), 2000);
  };

  const uploadProfileFile = async (file) => {
    if (!file) return;
    setProfileError("");
    setProfileNotice("");
    setIsProfileLoading(true);

    try {
      const token = (localStorage.getItem("token") || "").replace(/[\r\n"]/g, "");
      if (!token) {
        throw new Error("You are not signed in.");
      }

      const uploadData = new FormData();
      uploadData.append("image", file);
      const res = await fetch(`${API_ORIGIN}/api/users/profile/photo`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: uploadData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to upload photo.");
      }

      localStorage.setItem("user", JSON.stringify(data));
      setProfileUser(data);
      setProfilePreview(
        resolveImageUrl(data.profilePicture || data.avatar || ""),
      );
      setProfileNotice("Profile photo updated.");
      window.dispatchEvent(new Event("profile:updated"));
      setTimeout(() => setProfileNotice(""), 2500);
    } catch (err) {
      setProfileError(err.message || "Unable to upload photo.");
      setTimeout(() => setProfileError(""), 3000);
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleProfileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePreview(reader.result);
    };
    reader.readAsDataURL(file);

    uploadProfileFile(file);
    event.target.value = "";
  };

  const handleProfileRemove = async () => {
    setProfileError("");
    setProfileNotice("");
    setIsProfileLoading(true);

    try {
      const token = (localStorage.getItem("token") || "").replace(/[\r\n"]/g, "");
      if (!token) {
        throw new Error("You are not signed in.");
      }

      const res = await fetch(`${API_ORIGIN}/api/users/profile/photo`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to remove photo.");
      }

      const existing = getUser();
      const nextUser = existing
        ? { ...existing, profilePicture: "", avatar: "" }
        : null;
      if (nextUser) {
        localStorage.setItem("user", JSON.stringify(nextUser));
      }
      setProfileUser(nextUser);
      setProfilePreview("");
      setProfileNotice("Profile photo removed.");
      window.dispatchEvent(new Event("profile:updated"));
      setTimeout(() => setProfileNotice(""), 2500);
    } catch (err) {
      setProfileError(err.message || "Unable to remove photo.");
      setTimeout(() => setProfileError(""), 3000);
    } finally {
      setIsProfileLoading(false);
    }
  };

  const storagePercentage = Math.round((storageUsed / storageTotal) * 100);
  const storageCircumference = 2 * Math.PI * 40; // radius = 40
  const storageOffset = storageCircumference * (1 - storagePercentage / 100);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">System Configuration</h2>
        <p className="text-sm text-gray-500">
          Manage global institutional parameters and resource constraints.
        </p>
      </div>

      {saveMessage ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-600">
          {saveMessage}
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="p-1.5 bg-[var(--dash-accent-soft)] text-[var(--dash-accent)] rounded-lg">
                <Calendar className="w-4 h-4" />
              </div>
              Academic Cycles
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                  Semester Start Date
                </label>
                <input
                  type="date"
                  value={settings.semesterStart}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      semesterStart: event.target.value,
                    }))
                  }
                  className="w-full border border-gray-200 rounded-lg text-sm text-gray-900 font-semibold bg-white hover:bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[var(--dash-accent)] focus:border-transparent py-2.5 px-3 transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                  Semester End Date
                </label>
                <input
                  type="date"
                  value={settings.semesterEnd}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      semesterEnd: event.target.value,
                    }))
                  }
                  className="w-full border border-gray-200 rounded-lg text-sm text-gray-900 font-semibold bg-white hover:bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[var(--dash-accent)] focus:border-transparent py-2.5 px-3 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <h4 className="font-bold text-sm text-gray-900">
                  Active Semester Toggle
                </h4>
                <p className="text-xs text-gray-500">
                  Enable current cycle for student enrollment
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setSettings((prev) => ({
                    ...prev,
                    semesterActive: !prev.semesterActive,
                  }))
                }
                className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                  settings.semesterActive
                    ? "bg-[var(--dash-accent)]"
                    : "bg-gray-200"
                }`}
              >
                <span
                  className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                    settings.semesterActive ? "translate-x-7" : "translate-x-1"
                  }`}
                ></span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleSave}
              className="w-full py-3 bg-[var(--dash-accent)] hover:bg-[var(--dash-accent-strong)] text-white font-bold rounded-xl shadow-sm transition-all shadow-[rgba(15,118,110,0.2)]"
            >
              Update Cycle
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-gray-900 mb-4 flex items-center gap-2">
                  <div className="p-1.5 bg-cyan-50 text-cyan-500 rounded-lg">
                    <HardDrive className="w-3.5 h-3.5" />
                  </div>
                  Resource Constraints
                </h3>
                <div className="mb-4">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                    Max File Size (MB)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={settings.maxFileSizeMb}
                      onChange={(event) =>
                        setSettings((prev) => ({
                          ...prev,
                          maxFileSizeMb: Number(event.target.value),
                        }))
                      }
                      className="w-full border border-gray-200 rounded-lg text-sm text-gray-900 font-semibold bg-white hover:bg-gray-50 focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent py-2 px-3 pr-8 transition-all"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">
                      MB
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                  Allowed File Types
                </label>
                <div className="space-y-3">
                  {Object.entries(settings.allowedTypes).map(([key, value]) => (
                    <label
                      key={key}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={() =>
                          setSettings((prev) => ({
                            ...prev,
                            allowedTypes: {
                              ...prev.allowedTypes,
                              [key]: !value,
                            },
                          }))
                        }
                        className="w-4 h-4 rounded text-[var(--dash-accent)] focus:ring-2 focus:ring-[var(--dash-accent)] cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-gray-700">
                        {key.toUpperCase()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-gray-900 mb-4 flex items-center gap-2">
                  <div className="p-1.5 bg-[var(--dash-accent-soft)] text-[var(--dash-accent)] rounded-lg">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  User Permissions
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-all">
                    <span className="text-xs font-semibold text-gray-700">Student-Led Circle Creation</span>
                    <input
                      type="checkbox"
                      checked={settings.permissions.studentCircleCreation}
                      onChange={() =>
                        setSettings((prev) => ({
                          ...prev,
                          permissions: {
                            ...prev.permissions,
                            studentCircleCreation:
                              !prev.permissions.studentCircleCreation,
                          },
                        }))
                      }
                      className="w-4 h-4 rounded text-[var(--dash-accent)] focus:ring-2 focus:ring-[var(--dash-accent)] cursor-pointer"
                    />
                  </label>
                  <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-all">
                    <span className="text-xs font-semibold text-gray-700">Direct Messaging</span>
                    <input
                      type="checkbox"
                      checked={settings.permissions.directMessaging}
                      onChange={() =>
                        setSettings((prev) => ({
                          ...prev,
                          permissions: {
                            ...prev.permissions,
                            directMessaging: !prev.permissions.directMessaging,
                          },
                        }))
                      }
                      className="w-4 h-4 rounded text-[var(--dash-accent)] focus:ring-2 focus:ring-[var(--dash-accent)] cursor-pointer"
                    />
                  </label>
                  <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-all">
                    <span className="text-xs font-semibold text-gray-700">Public Profile Visibility</span>
                    <input
                      type="checkbox"
                      checked={settings.permissions.publicProfile}
                      onChange={() =>
                        setSettings((prev) => ({
                          ...prev,
                          permissions: {
                            ...prev.permissions,
                            publicProfile: !prev.permissions.publicProfile,
                          },
                        }))
                      }
                      className="w-4 h-4 rounded text-[var(--dash-accent)] focus:ring-2 focus:ring-[var(--dash-accent)] cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-gray-900 mb-4 flex items-center gap-2">
                  <div className="p-1.5 bg-[var(--dash-accent-soft)] text-[var(--dash-accent)] rounded-lg">
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                  Notification Rules
                </h3>
                <div className="mb-4">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                    System Alert Frequency
                  </label>
                  <select
                    value={settings.alertFrequency}
                    onChange={(event) =>
                      setSettings((prev) => ({
                        ...prev,
                        alertFrequency: event.target.value,
                      }))
                    }
                    className="w-full border border-gray-200 rounded-lg text-sm text-gray-900 font-semibold bg-white hover:bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[var(--dash-accent)] focus:border-transparent py-2.5 px-3 transition-all"
                  >
                    <option>Daily Summary</option>
                    <option>Real-time</option>
                    <option>Weekly Digest</option>
                  </select>
                </div>
                <p className="text-[9px] text-gray-400 leading-relaxed italic">
                  * Administrators will receive high-priority security alerts
                  regardless of this frequency setting.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="p-1.5 bg-[var(--dash-accent-soft)] text-[var(--dash-accent)] rounded-lg">
                <Camera className="w-4 h-4" />
              </div>
              Admin Profile
            </h3>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                {profilePreview ? (
                  <img
                    src={profilePreview}
                    alt="Admin profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="w-6 h-6 text-gray-300" />
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {profileUser?.fullName || "Admin User"}
                </p>
                <p className="text-xs text-gray-500">
                  {profileUser?.email || "admin@smartstudycircle"}
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  JPG or PNG, up to 5 MB.
                </p>
              </div>
            </div>

            {profileError ? (
              <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 p-2 text-xs text-rose-600">
                {profileError}
              </div>
            ) : null}
            {profileNotice ? (
              <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-600">
                {profileNotice}
              </div>
            ) : null}

            <div className="flex gap-3">
              <label
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer ${
                  isProfileLoading ? "opacity-60 pointer-events-none" : ""
                }`}
              >
                <Upload className="w-4 h-4 text-gray-500" />
                {isProfileLoading ? "Uploading..." : "Upload Photo"}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleProfileSelect}
                />
              </label>
              <button
                type="button"
                onClick={handleProfileRemove}
                disabled={isProfileLoading || !profilePreview}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
            <h3 className="font-bold text-gray-900 mb-6 w-full text-center">
              Storage Management
            </h3>

            {cleanupMessage && (
              <div className="w-full mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-600">
                {cleanupMessage}
              </div>
            )}

            <div className="relative w-40 h-40 mb-6">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#f3f4f6"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#0f766e"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={storageCircumference}
                  strokeDashoffset={storageOffset}
                  className="drop-shadow-sm transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-extrabold text-gray-900 tracking-tight leading-none">
                  {storagePercentage}%
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                  Used
                </span>
              </div>
            </div>

            <div className="text-center mb-6">
              <p className="text-lg font-bold text-gray-900">
                {storageUsed} GB <span className="text-gray-400 font-medium">/ {storageTotal} GB</span>
              </p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
                Enterprise Cloud Storage
              </p>
            </div>

            <div className="flex w-full gap-3">
              <button
                onClick={handleCleanUp}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all active:scale-95"
              >
                Clean Up
              </button>
              <button
                onClick={handleUpgradePlan}
                className="flex-1 py-2.5 bg-[var(--dash-accent)] hover:bg-[var(--dash-accent-strong)] text-white font-bold text-xs rounded-xl shadow-sm shadow-[rgba(15,118,110,0.2)] transition-all active:scale-95"
              >
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-teal-600 rounded-2xl p-5 text-white flex items-center justify-between shadow-lg shadow-teal-500/20 relative overflow-hidden mt-6">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-700 to-teal-600 opacity-50"></div>
        <div className="relative z-10">
          <h3 className="font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> System Health: Optimal
          </h3>
          <p className="text-xs text-teal-100 mt-1">
            All backend clusters are operating within normal parameters.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full border border-white/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-white">
            Live Sync Active
          </span>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          className="px-5 py-2.5 bg-[var(--dash-ink)] text-white text-sm font-semibold rounded-xl shadow-sm"
        >
          Save All Settings
        </button>
      </div>
    </div>
  );
}
