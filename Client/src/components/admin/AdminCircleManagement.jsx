import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Eye,
  Trash2,
  Shield,
  Settings2,
  Sparkles,
  TrendingUp,
  Search,
} from "lucide-react";
import { clearAuth } from "../../utils/authUtils";

const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN ||
  `${window.location.protocol}//${window.location.hostname}:5000`;
const OVERVIEW_API = `${API_ORIGIN}/api/progress/admin/overview`;
const CIRCLES_API = `${API_ORIGIN}/api/circles`;

const createHeaders = () => {
  const token = (localStorage.getItem("token") || "").replace(/[\r\n"]/g, "");
  return token
    ? {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    : { "Content-Type": "application/json" };
};

const getInitials = (subject, moduleCode) => {
  const seed = subject || moduleCode || "SC";
  const parts = String(seed).trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const getActivityMeta = (memberCount) => {
  const count = Number(memberCount || 0);
  if (count >= 100) {
    return { label: "High", color: "text-emerald-500" };
  }
  if (count >= 40) {
    return { label: "Medium", color: "text-amber-500" };
  }
  return { label: "Low", color: "text-rose-500" };
};

const initialCreateForm = {
  subject: "",
  moduleCode: "",
  semester: "",
  year: "1",
  visibility: "public",
  description: "",
};

export default function AdminCircleManagement() {
  const navigate = useNavigate();
  const [circles, setCircles] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [activityFilter, setActivityFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCircle, setSelectedCircle] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState(initialCreateForm);
  const [createErrors, setCreateErrors] = useState({});
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const loadOverview = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(OVERVIEW_API, { headers: createHeaders() });
      if (res.status === 401) {
        clearAuth();
        navigate("/admin", { replace: true });
        return;
      }

      const data = await res.json();
      if (!res.ok || data?.success === false) {
        throw new Error(data.message || "Failed to load circles.");
      }

      setCircles(Array.isArray(data.circles) ? data.circles : []);
      setSummary(data.summary || null);
    } catch (err) {
      setError(err.message || "Unable to load circles.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const subjectOptions = useMemo(() => {
    const values = new Set();
    circles.forEach((circle) => {
      if (circle.subject) values.add(circle.subject);
    });
    return Array.from(values).sort();
  }, [circles]);

  const filteredCircles = useMemo(() => {
    return circles.filter((circle) => {
      const subjectMatch =
        subjectFilter === "all" || circle.subject === subjectFilter;
      const activity = getActivityMeta(circle.memberCount).label.toLowerCase();
      const activityMatch =
        activityFilter === "all" || activity === activityFilter;
      const query = searchQuery.trim().toLowerCase();
      const searchMatch =
        !query ||
        String(circle.subject || "").toLowerCase().includes(query) ||
        String(circle.moduleCode || "").toLowerCase().includes(query);

      return subjectMatch && activityMatch && searchMatch;
    });
  }, [circles, subjectFilter, activityFilter, searchQuery]);

  const activeCount = circles.filter((circle) => circle.isActive).length;
  const totalCount = circles.length;

  const validateCreateForm = (values) => {
    const nextErrors = {};
    if (!values.subject.trim()) nextErrors.subject = "Subject is required.";
    if (!values.moduleCode.trim())
      nextErrors.moduleCode = "Module code is required.";
    if (!values.semester.trim()) nextErrors.semester = "Semester is required.";
    if (!values.year) nextErrors.year = "Year is required.";
    if (values.description && values.description.length > 250) {
      nextErrors.description = "Description must be 250 characters or less.";
    }
    return nextErrors;
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    const errors = validateCreateForm(createForm);
    setCreateErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsCreating(true);
    try {
      const res = await fetch(CIRCLES_API, {
        method: "POST",
        headers: createHeaders(),
        body: JSON.stringify({
          subject: createForm.subject.trim(),
          moduleCode: createForm.moduleCode.trim(),
          semester: createForm.semester.trim(),
          year: Number(createForm.year),
          visibility: createForm.visibility,
          description: createForm.description.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create circle.");
      }

      setIsCreateOpen(false);
      setCreateForm(initialCreateForm);
      setCreateErrors({});
      loadOverview();
    } catch (err) {
      setError(err.message || "Unable to create circle.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (circle) => {
    if (!circle?.id) return;
    if (!window.confirm(`Delete ${circle.subject || "this circle"}?`)) return;

    setDeletingId(circle.id);
    try {
      const res = await fetch(`${CIRCLES_API}/${circle.id}`, {
        method: "DELETE",
        headers: createHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401 || res.status === 403) {
        clearAuth();
        navigate("/admin", { replace: true });
        return;
      }
      if (!res.ok) {
        throw new Error(data.message || "Failed to delete circle.");
      }

      setCircles((prev) => prev.filter((item) => item.id !== circle.id));
    } catch (err) {
      setError(err.message || "Unable to delete circle.");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Circle Management</h2>
          <p className="text-sm text-gray-500">
            Monitor and moderate active study circles across the platform.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--dash-accent)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--dash-accent-strong)] shadow-sm transition-all shadow-[rgba(15,118,110,0.2)]"
        >
          <Plus className="w-4 h-4" /> Create New Circle
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm md:w-1/3 flex flex-col justify-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
            Total Circles
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900">
              {totalCount}
            </span>
          </div>
          <p className="text-xs font-semibold text-emerald-500 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> {activeCount} active
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm md:w-2/3 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                Filter By Subject
              </label>
              <select
                className="w-full border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50 focus:ring-[var(--dash-accent)] py-2"
                value={subjectFilter}
                onChange={(event) => setSubjectFilter(event.target.value)}
              >
                <option value="all">All Subjects</option>
                {subjectOptions.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                Filter By Activity
              </label>
              <select
                className="w-full border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50 focus:ring-[var(--dash-accent)] py-2"
                value={activityFilter}
                onChange={(event) => setActivityFilter(event.target.value)}
              >
                <option value="all">All Levels</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search circles..."
                  className="w-full border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50 focus:ring-[var(--dash-accent)] py-2 pl-9 pr-3"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setSubjectFilter("all");
                setActivityFilter("all");
                setSearchQuery("");
              }}
              className="px-4 py-2 border border-gray-200 text-gray-600 font-semibold text-sm rounded-lg hover:bg-gray-50 transition-colors bg-white shadow-sm whitespace-nowrap"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] text-gray-400 uppercase tracking-wider border-b border-gray-50 bg-gray-50/30">
                <th className="px-6 py-4 font-bold">Circle Name</th>
                <th className="px-6 py-4 font-bold text-center">Module</th>
                <th className="px-6 py-4 font-bold text-center">Member Count</th>
                <th className="px-6 py-4 font-bold">Activity Level</th>
                <th className="px-6 py-4 font-bold">Created</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-gray-400">
                    Loading circles...
                  </td>
                </tr>
              ) : filteredCircles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-gray-400">
                    No circles match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredCircles.map((circle) => {
                  const activity = getActivityMeta(circle.memberCount);
                  return (
                    <tr
                      key={circle.id}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold bg-emerald-100 text-emerald-600 shadow-sm group-hover:scale-105 transition-transform">
                          {getInitials(circle.subject, circle.moduleCode)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-[var(--dash-accent)] transition-colors">
                            {circle.subject || "Untitled Circle"}
                          </p>
                          <p className="text-xs text-gray-400 font-medium tracking-wide">
                            ID: {circle.id}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-gray-600 font-medium text-xs">
                          {circle.moduleCode || "--"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-gray-900 font-bold">
                          {circle.memberCount ?? 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-bold ${activity.color}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {activity.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-medium text-xs">
                        {circle.createdAt
                          ? new Date(circle.createdAt).toLocaleDateString()
                          : "--"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedCircle(circle)}
                            className="p-1.5 text-gray-400 hover:text-[var(--dash-accent)] hover:bg-[var(--dash-accent-soft)] border border-transparent hover:border-[rgba(15,118,110,0.1)] rounded-lg transition-all delay-75"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === circle.id}
                            onClick={() => handleDelete(circle)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition-all delay-75 disabled:opacity-60"
                          >
                            <Trash2 className="w-4 h-4" />
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
          <p>Showing {filteredCircles.length} of {totalCount} circles</p>
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
            <span className="px-1 text-gray-400">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 font-medium text-gray-600">
              8
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50">
              &gt;
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[linear-gradient(135deg,#0f766e,#14b8a6)] rounded-2xl p-6 text-white relative overflow-hidden shadow-lg shadow-[rgba(15,118,110,0.2)]">
          <div className="absolute -right-4 top-1/2 -translate-y-1/2 opacity-20 transform rotate-12">
            <Sparkles className="w-48 h-48" />
          </div>
          <div className="relative z-10 w-3/4">
            <h3 className="text-xl font-bold mb-2">Automated Moderation</h3>
            <p className="text-sm text-white/80 mb-6 leading-relaxed">
              Enable AI-powered filters to maintain community standards
              automatically.
            </p>
            <button className="bg-white text-[var(--dash-accent)] font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-[var(--dash-surface-2)] hover:scale-105 transition-all shadow-sm">
              <Settings2 className="w-4 h-4" /> Configure AI
            </button>
          </div>
        </div>

        <div className="bg-[var(--dash-ink)] rounded-2xl p-6 text-white shadow-xl relative flex flex-col justify-between">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-gray-400" /> Platform Health
          </h3>

          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-gray-400">Active Circles</span>
                <span className="text-[var(--dash-accent)]">
                  {totalCount ? Math.round((activeCount / totalCount) * 100) : 0}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--dash-accent)] rounded-full shadow-[0_0_10px_rgba(15,118,110,0.5)]"
                  style={{
                    width: totalCount
                      ? `${(activeCount / totalCount) * 100}%`
                      : "0%",
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-gray-400">Total Students</span>
                <span className="text-blue-400">
                  {summary?.totalStudents ?? 0}
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[72%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-gray-500 mt-6 pt-4 border-t border-white/10">
            Last global sync: 2 minutes ago
          </p>
        </div>
      </div>

      {selectedCircle ? (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setSelectedCircle(null)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedCircle.subject || "Untitled Circle"}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedCircle.moduleCode || "No module code"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCircle(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-800">Semester</span>
                <span>{selectedCircle.semester || "--"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-800">Year</span>
                <span>{selectedCircle.year || "--"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-800">Visibility</span>
                <span className="capitalize">
                  {selectedCircle.visibility || "public"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-800">Members</span>
                <span>{selectedCircle.memberCount ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-800">Created</span>
                <span>
                  {selectedCircle.createdAt
                    ? new Date(selectedCircle.createdAt).toLocaleDateString()
                    : "--"}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isCreateOpen ? (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setIsCreateOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-white rounded-2xl p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Create Study Circle
            </h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-600">
                    Subject
                  </label>
                  <input
                    value={createForm.subject}
                    onChange={(event) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        subject: event.target.value,
                      }))
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />
                  {createErrors.subject ? (
                    <p className="text-xs text-rose-500 mt-1">
                      {createErrors.subject}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600">
                    Module Code
                  </label>
                  <input
                    value={createForm.moduleCode}
                    onChange={(event) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        moduleCode: event.target.value,
                      }))
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />
                  {createErrors.moduleCode ? (
                    <p className="text-xs text-rose-500 mt-1">
                      {createErrors.moduleCode}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600">
                    Semester
                  </label>
                  <input
                    value={createForm.semester}
                    onChange={(event) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        semester: event.target.value,
                      }))
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />
                  {createErrors.semester ? (
                    <p className="text-xs text-rose-500 mt-1">
                      {createErrors.semester}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600">Year</label>
                  <select
                    value={createForm.year}
                    onChange={(event) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        year: event.target.value,
                      }))
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  >
                    {["1", "2", "3", "4"].map((year) => (
                      <option key={year} value={year}>
                        Year {year}
                      </option>
                    ))}
                  </select>
                  {createErrors.year ? (
                    <p className="text-xs text-rose-500 mt-1">
                      {createErrors.year}
                    </p>
                  ) : null}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">
                  Visibility
                </label>
                <select
                  value={createForm.visibility}
                  onChange={(event) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      visibility: event.target.value,
                    }))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={createForm.description}
                  onChange={(event) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
                {createErrors.description ? (
                  <p className="text-xs text-rose-500 mt-1">
                    {createErrors.description}
                  </p>
                ) : null}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 rounded-lg bg-[var(--dash-accent)] text-white font-semibold disabled:opacity-60"
                >
                  {isCreating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
