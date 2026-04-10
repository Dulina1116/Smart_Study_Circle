import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Filter,
  FileText,
  MessageSquare,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { clearAuth } from "../../utils/authUtils";

const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN ||
  `${window.location.protocol}//${window.location.hostname}:5000`;
const REPORTS_API = `${API_ORIGIN}/api/reports`;

const createHeaders = () => {
  const token = (localStorage.getItem("token") || "").replace(/[\r\n"]/g, "");
  return token
    ? {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    : { "Content-Type": "application/json" };
};

const formatDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleString();
};

const isSpamReport = (report) => {
  const combined = `${report.title || ""} ${report.description || ""}`.toLowerCase();
  return combined.includes("spam");
};

export default function AdminContentModeration() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All Content");
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const loadReports = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(`${REPORTS_API}?status=all`, {
        headers: createHeaders(),
      });
      if (res.status === 401) {
        clearAuth();
        navigate("/admin", { replace: true });
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to load reports.");
      }
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load reports.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const updateStatus = async (reportId, status) => {
    if (!reportId) return;
    setUpdatingId(reportId);
    try {
      const res = await fetch(`${REPORTS_API}/${reportId}/status`, {
        method: "PUT",
        headers: createHeaders(),
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update report.");
      }
      setReports((prev) =>
        prev.map((report) => (report._id === reportId ? data : report)),
      );
    } catch (err) {
      setError(err.message || "Unable to update report.");
    } finally {
      setUpdatingId("");
    }
  };

  const filteredReports = useMemo(() => {
    if (activeTab === "Urgent Only") {
      return reports.filter(
        (report) => report.isActionRequired || report.status === "Pending",
      );
    }
    if (activeTab === "Spam") {
      return reports.filter((report) => isSpamReport(report));
    }
    return reports;
  }, [reports, activeTab]);

  const stats = useMemo(() => {
    const totalFlagged = reports.length;
    const pending = reports.filter((r) =>
      ["Pending", "Reviewed"].includes(r.status),
    ).length;

    const resolvedLastDay = reports.filter((report) => {
      if (!report.updatedAt) return false;
      const diff = Date.now() - new Date(report.updatedAt).getTime();
      return diff <= 24 * 60 * 60 * 1000 &&
        ["Resolved", "Dismissed"].includes(report.status);
    }).length;

    const resolvedDurations = reports
      .filter((report) =>
        ["Resolved", "Dismissed"].includes(report.status),
      )
      .map((report) => {
        const created = new Date(report.createdAt).getTime();
        const updated = new Date(report.updatedAt || report.createdAt).getTime();
        return Math.max(0, updated - created);
      });

    const avgResponseMs = resolvedDurations.length
      ? resolvedDurations.reduce((sum, value) => sum + value, 0) /
        resolvedDurations.length
      : 0;

    const avgResponseHours = avgResponseMs
      ? `${(avgResponseMs / 3600000).toFixed(1)}h`
      : "N/A";

    return {
      totalFlagged,
      pending,
      resolvedLastDay,
      avgResponseHours,
    };
  }, [reports]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Content Moderation Queue
        </h2>
        <p className="text-sm text-gray-500">
          Review and manage reported content across the platform.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
            Total Flagged
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-gray-900">
              {stats.totalFlagged}
            </span>
            <span className="text-xs font-semibold text-rose-500">
              {stats.pending} pending
            </span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
            Pending Review
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-gray-900">
              {stats.pending}
            </span>
            <span className="text-xs font-semibold text-amber-500">
              Action Required
            </span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
            Resolved (24h)
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-gray-900">
              {stats.resolvedLastDay}
            </span>
            <span className="text-xs font-semibold text-emerald-500">
              Recent activity
            </span>
          </div>
        </div>
        <div className="bg-[var(--dash-accent)] p-5 rounded-2xl shadow-lg shadow-[rgba(15,118,110,0.2)] text-white flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 bg-white/10 w-24 h-24 rounded-full blur-xl"></div>
          <p className="text-[10px] font-bold text-teal-100 uppercase tracking-widest mb-2 relative z-10">
            Average Response
          </p>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-2xl font-extrabold text-white">
              {stats.avgResponseHours}
            </span>
            <span className="text-xs font-semibold text-teal-200">
              Target: 2h
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex gap-6">
          {["All Content", "Urgent Only", "Spam"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm font-bold relative transition-colors ${
                activeTab === tab
                  ? "text-gray-900"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute -bottom-[18px] left-0 w-full h-0.5 bg-[var(--dash-accent)] rounded-t"></span>
              )}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[var(--dash-ink)] text-white text-xs font-bold rounded-xl hover:bg-black shadow-sm transition-all">
          <Filter className="w-3 h-3" /> More Filters
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] text-gray-400 uppercase tracking-wider border-b border-gray-50 bg-gray-50/30">
                <th className="px-6 py-4 font-bold">Content Type</th>
                <th className="px-6 py-4 font-bold">Reported By</th>
                <th className="px-6 py-4 font-bold">Reason</th>
                <th className="px-6 py-4 font-bold">Date Flagged</th>
                <th className="px-6 py-4 font-bold text-center">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-gray-400">
                    Loading moderation queue...
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-gray-400">
                    No reports match this filter.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => {
                  const icon = report.title?.toLowerCase().includes("resource")
                    ? FileText
                    : MessageSquare;
                  const severity = report.isActionRequired ? "Urgent" : "Low";
                  const severityColor = report.isActionRequired
                    ? "text-rose-500 bg-rose-50"
                    : "text-gray-500 bg-gray-50";
                  const statusColor =
                    report.status === "Pending"
                      ? "text-amber-500"
                      : report.status === "Reviewed"
                        ? "text-blue-500"
                        : report.status === "Resolved"
                          ? "text-emerald-500"
                          : "text-gray-500";

                  return (
                    <tr
                      key={report._id}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4 flex items-start gap-4">
                        <div
                          className={`p-2 rounded-lg ${
                            report.isActionRequired
                              ? "text-rose-500 bg-rose-50"
                              : "text-[var(--dash-accent)] bg-[var(--dash-accent-soft)]"
                          } mt-1`}
                        >
                          <icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-[var(--dash-accent)] transition-colors">
                            {report.title || "Reported content"}
                          </p>
                          <p className="text-[10px] text-gray-400 font-medium tracking-wide mt-0.5">
                            Circle: {report.circleId?.circleName || "Unknown"}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-700">
                          {report.reportedBy?.fullName ||
                            report.reportedBy?.displayName ||
                            report.reportedBy?.email ||
                            "System"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold tracking-wide text-gray-500">
                          {report.description || "No reason provided"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-medium text-xs">
                        {formatDateTime(report.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${severityColor}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              severity === "Urgent"
                                ? "bg-rose-500"
                                : "bg-gray-400"
                            }`}
                          ></span>
                          {severity}
                        </span>
                        <p className={`text-[10px] mt-1 ${statusColor}`}>
                          {report.status}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end items-center gap-3">
                          <button
                            disabled={updatingId === report._id}
                            onClick={() => updateStatus(report._id, "Dismissed")}
                            className="text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors disabled:opacity-60"
                          >
                            Dismiss
                          </button>
                          <button
                            disabled={updatingId === report._id}
                            onClick={() => updateStatus(report._id, "Reviewed")}
                            className="px-3 py-1.5 bg-[var(--dash-accent)] hover:bg-[var(--dash-accent-strong)] text-white text-xs font-bold rounded-lg shadow-sm shadow-[rgba(15,118,110,0.2)] transition-all disabled:opacity-60"
                          >
                            Review Detail
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-50 flex items-center justify-between text-sm text-gray-500">
          <p>Showing {filteredReports.length} of {reports.length} results</p>
          <div className="flex gap-1 items-center">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50">
              &lt;
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--dash-accent)] text-white font-bold shadow-sm">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 font-medium text-gray-600">
              2
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 font-medium text-gray-600">
              3
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50">
              &gt;
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-[linear-gradient(135deg,#0f766e,#14b8a6)] rounded-2xl p-6 text-white relative overflow-hidden shadow-lg shadow-[rgba(15,118,110,0.2)]">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-20 transform rotate-12 -translate-x-4">
            <AlertTriangle className="w-40 h-40" />
          </div>
          <div className="relative z-10 w-[80%]">
            <h3 className="text-xl font-bold mb-2">Policy Update</h3>
            <p className="text-sm text-teal-50 mb-6 leading-relaxed">
              Automated moderation flags are active. Reports marked urgent are
              prioritized in the queue.
            </p>
            <button className="bg-white text-[var(--dash-accent)] font-bold px-5 py-2.5 rounded-xl hover:bg-[var(--dash-surface-2)] hover:scale-105 transition-all shadow-sm">
              Review Guidelines
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm transform hover:-translate-y-1 transition-transform">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" /> Moderator
              Stats
            </h3>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Queue Size
              </p>
            </div>
            <div>
              <span className="text-2xl font-extrabold text-gray-900">
                {stats.pending}
              </span>
            </div>
          </div>

          <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
            <span className="text-emerald-500 font-bold">
              {stats.resolvedLastDay} resolved today
            </span>{" "}
            across the moderation queue.
          </p>
        </div>
      </div>
    </div>
  );
}
