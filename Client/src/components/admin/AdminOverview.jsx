import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Database,
  AlertCircle,
  GraduationCap,
  Archive,
  CheckCircle,
  Clock,
} from "lucide-react";
import { clearAuth } from "../../utils/authUtils";

const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN ||
  `${window.location.protocol}//${window.location.hostname}:5000`;
const OVERVIEW_API = `${API_ORIGIN}/api/progress/admin/overview`;
const REPORTS_API = `${API_ORIGIN}/api/reports`;

const createHeaders = () => {
  const token = (localStorage.getItem("token") || "").replace(/[\r\n"]/g, "");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const formatRelativeTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  return date.toLocaleDateString();
};

const startOfWeek = (date) => {
  const value = new Date(date);
  const day = (value.getDay() + 6) % 7;
  value.setDate(value.getDate() - day);
  value.setHours(0, 0, 0, 0);
  return value;
};

export default function AdminOverview() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOverview = async () => {
      setIsLoading(true);
      setError("");
      try {
        const headers = createHeaders();
        const [overviewRes, reportsRes] = await Promise.all([
          fetch(OVERVIEW_API, { headers }),
          fetch(REPORTS_API, { headers }),
        ]);

        if (overviewRes.status === 401 || reportsRes.status === 401) {
          clearAuth();
          navigate("/admin", { replace: true });
          return;
        }

        const overviewData = await overviewRes.json();
        if (!overviewRes.ok || overviewData?.success === false) {
          throw new Error(
            overviewData.message || "Failed to load admin overview.",
          );
        }

        const reportsData = await reportsRes.json();
        if (!reportsRes.ok) {
          throw new Error(reportsData.message || "Failed to load reports.");
        }

        setOverview(overviewData);
        setReports(Array.isArray(reportsData) ? reportsData : []);
      } catch (err) {
        setError(err.message || "Unable to load admin overview.");
      } finally {
        setIsLoading(false);
      }
    };

    loadOverview();
  }, [navigate]);

  const summary = overview?.summary || {};
  const circles = Array.isArray(overview?.circles) ? overview.circles : [];
  const pendingReports = reports.filter((report) =>
    ["Pending", "Reviewed"].includes(report.status),
  );

  const stats = useMemo(
    () => [
      {
        icon: Users,
        label: "Total Students",
        value: toNumber(summary.totalStudents),
        subtext: `${toNumber(summary.activeStudents)} active`,
        iconColor: "text-cyan-500",
      },
      {
        icon: GraduationCap,
        label: "Active Study Circles",
        value: toNumber(summary.activeStudyCircles),
        subtext: `${toNumber(summary.totalStudyCircles)} total`,
        iconColor: "text-[var(--dash-accent)]",
      },
      {
        icon: Database,
        label: "Modules Running",
        value: toNumber(summary.totalModules),
        subtext: `${toNumber(summary.totalResourcesShared)} resources`,
        iconColor: "text-amber-500",
      },
      {
        icon: AlertCircle,
        label: "Pending Reports",
        value: pendingReports.length,
        subtext: pendingReports.length ? "Needs review" : "All clear",
        iconColor: "text-rose-500",
      },
    ],
    [summary, pendingReports.length],
  );

  const weeklyStats = useMemo(() => {
    if (!circles.length) return [];

    const now = new Date();
    const currentWeek = startOfWeek(now);
    const buckets = Array.from({ length: 9 }, (_, index) => {
      const start = new Date(currentWeek);
      start.setDate(start.getDate() - (8 - index) * 7);
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      return { start, end };
    });

    return buckets.map(({ start, end }) => {
      const circlesInWeek = circles.filter((circle) => {
        const createdAt = new Date(circle.createdAt);
        return createdAt >= start && createdAt < end;
      });

      const newCircles = circlesInWeek.length;
      const newMembers = circlesInWeek.reduce(
        (sum, circle) => sum + toNumber(circle.memberCount),
        0,
      );

      return {
        label: `${start.getMonth() + 1}/${start.getDate()}`,
        newCircles,
        newMembers,
      };
    });
  }, [circles]);

  const activityItems = useMemo(() => {
    const reportItems = reports.map((report) => ({
      id: report._id,
      icon: AlertCircle,
      action: `Report: ${report.title || "Content review"}`,
      actor:
        report.reportedBy?.fullName ||
        report.reportedBy?.displayName ||
        report.reportedBy?.email ||
        "System",
      time: formatRelativeTime(report.createdAt),
      status: report.status || "Pending",
      date: report.createdAt,
    }));

    const circleItems = circles.map((circle) => ({
      id: circle.id,
      icon: GraduationCap,
      action: `Circle created: ${circle.subject || "Untitled"}`,
      actor: "System",
      time: formatRelativeTime(circle.createdAt),
      status: circle.isActive ? "Active" : "Inactive",
      date: circle.createdAt,
    }));

    return [...reportItems, ...circleItems]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [reports, circles]);

  const topGroups = Array.isArray(overview?.topPerformingGroups)
    ? overview.topPerformingGroups
    : [];

  const maxCircles = Math.max(
    1,
    ...weeklyStats.map((stat) => stat.newCircles),
  );
  const maxMembers = Math.max(
    1,
    ...weeklyStats.map((stat) => stat.newMembers),
  );

  const statusStyles = {
    Pending: "text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-xs",
    Reviewed: "text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs",
    Resolved: "text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs",
    Dismissed: "text-gray-500 bg-gray-50 px-2 py-0.5 rounded text-xs",
    Active: "text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs",
    Inactive: "text-gray-500 bg-gray-50 px-2 py-0.5 rounded text-xs",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">System Overview</h2>
        <p className="text-sm text-gray-500">
          Welcome back, Admin. Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
          Loading admin overview...
        </div>
      ) : null}

      {!isLoading ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center relative overflow-hidden"
              >
                <div className={`mt-2 p-2 rounded-full mb-3 ${stat.iconColor}`}>
                  <stat.icon className="w-6 h-6" />
                </div>

                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-gray-900">
                    {stat.value}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-2 font-medium">
                  {stat.subtext}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Growth Analytics
                    </h3>
                    <p className="text-sm text-gray-500">
                      Study circles and member growth (last 9 weeks)
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-gray-400">
                    Updated now
                  </span>
                </div>

                {weeklyStats.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-200 p-6 text-sm text-gray-500 text-center">
                    No activity yet. Create study circles to see trends.
                  </div>
                ) : (
                  <div className="h-48 flex items-end justify-between gap-2 overflow-hidden px-2">
                    {weeklyStats.map((stat, index) => (
                      <div
                        key={`${stat.label}-${index}`}
                        className="flex gap-1 w-full max-w-[40px] h-full items-end group"
                      >
                        <div
                          className="w-1/2 bg-teal-500 rounded-t-sm hover:opacity-80 transition-opacity"
                          style={{
                            height: `${
                              (stat.newCircles / maxCircles) * 100
                            }%`,
                          }}
                          title={`${stat.newCircles} new circles`}
                        ></div>
                        <div
                          className="w-1/2 bg-amber-400 rounded-t-sm hover:opacity-80 transition-opacity"
                          style={{
                            height: `${
                              (stat.newMembers / maxMembers) * 100
                            }%`,
                          }}
                          title={`${stat.newMembers} members joined`}
                        ></div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 mt-6">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="w-3 h-3 rounded-full bg-teal-500"></span>
                    New Circles
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                    New Members
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900">
                    Recent System Activity
                  </h3>
                  <button className="text-sm font-semibold text-[var(--dash-accent)] hover:text-[var(--dash-accent-strong)]">
                    View All
                  </button>
                </div>

                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-50">
                      <th className="pb-3 font-medium">Action</th>
                      <th className="pb-3 font-medium">Administrator</th>
                      <th className="pb-3 font-medium text-center">Timestamp</th>
                      <th className="pb-3 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {activityItems.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-4 text-center text-xs text-gray-400"
                        >
                          No recent activity yet.
                        </td>
                      </tr>
                    ) : (
                      activityItems.map((activity) => (
                        <tr
                          key={activity.id}
                          className="hover:bg-gray-50/50"
                        >
                          <td className="py-4 flex gap-3 items-center">
                            <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                              <activity.icon className="w-4 h-4" />
                            </div>
                            <span className="font-semibold text-gray-800">
                              {activity.action}
                            </span>
                          </td>
                          <td className="py-4 text-gray-600">
                            {activity.actor}
                          </td>
                          <td className="py-4 text-center text-gray-500 text-xs">
                            {activity.time}
                          </td>
                          <td className="py-4 text-right">
                            <span
                              className={`font-semibold text-xs tracking-wide ${
                                statusStyles[activity.status] ||
                                "text-gray-500"
                              }`}
                            >
                              {activity.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="p-1 bg-rose-100 rounded-full">
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                  </div>
                  Moderation Snapshot
                </h3>

                <div className="space-y-3">
                  {pendingReports.length === 0 ? (
                    <div className="text-sm text-gray-600 leading-relaxed">
                      No pending reports. Everything looks good.
                    </div>
                  ) : (
                    pendingReports.slice(0, 2).map((report) => (
                      <div
                        key={report._id}
                        className="border border-rose-100 p-3 rounded-xl bg-rose-50"
                      >
                        <p className="text-xs text-gray-600 mb-0.5">
                          {report.circleId?.circleName || "Study Circle"}
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {report.title || "Reported content"}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">
                            {report.status || "Pending"}
                          </span>
                          <button className="text-xs font-semibold text-[var(--dash-accent)]">
                            Review Now
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-gray-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                <h3 className="font-bold text-lg mb-5">System Alerts</h3>

                <div className="space-y-3 relative z-10">
                  <div className="flex gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/20">
                      <Archive className="w-5 h-5 text-amber-400 shrink-0" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-white">
                        Resources Shared
                      </h4>
                      <p className="text-xs text-gray-400 mt-1 font-medium">
                        {toNumber(summary.totalResourcesShared)} resources added
                      </p>
                      <p className="text-[11px] text-gray-500 mt-1">
                        Updated now
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                    <div className="p-2 rounded-lg bg-emerald-500/20">
                      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-white">
                        Study Plans Created
                      </h4>
                      <p className="text-xs text-gray-400 mt-1 font-medium">
                        {toNumber(summary.totalStudyPlansCreated)} plans generated
                      </p>
                      <p className="text-[11px] text-gray-500 mt-1">
                        Last sync: just now
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <Clock className="w-5 h-5 text-blue-400 shrink-0" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-white">
                        Active Modules
                      </h4>
                      <p className="text-xs text-gray-400 mt-1 font-medium">
                        {toNumber(summary.totalModules)} modules running
                      </p>
                      <p className="text-[11px] text-gray-500 mt-1">
                        Updated today
                      </p>
                    </div>
                  </div>
                </div>

                <button className="w-full mt-5 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold py-2.5 rounded-lg transition-colors">
                  System Health Dashboard
                </button>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-teal-700 to-teal-900 p-6 text-white relative overflow-hidden group shadow-lg">
                <div className="absolute inset-0 z-0">
                  <div className="absolute inset-0 bg-teal-900/20 mix-blend-overlay"></div>
                  <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 blur-3xl rounded-full"></div>
                </div>
                <div className="relative z-10">
                  <h3 className="font-bold text-lg mb-2">Top Performing Groups</h3>
                  <p className="text-sm text-teal-50">
                    {topGroups.length
                      ? `${topGroups[0]?.name || "Group"} leads with ${
                          topGroups[0]?.memberCount || 0
                        } member${topGroups[0]?.memberCount !== 1 ? 's' : ''}.`
                      : "No group data available yet."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
