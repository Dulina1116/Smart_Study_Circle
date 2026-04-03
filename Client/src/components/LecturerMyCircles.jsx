import React, { useState } from "react";
import {
  Plus,
  Download,
  MoreVertical,
  Users,
  CheckCircle,
  Clock,
  Info,
  ChevronDown,
  X,
  Lock,
  Copy,
  Calendar,
  UserPlus,
  ArrowRight,
  Edit,
  Trash2,
} from "lucide-react";

// Dummy Data mapped from the mock
// Empty out initial dummy data; we fetch from backend now
const initialCircles = [];

export default function LecturerMyCircles({ user }) {
  const [circles, setCircles] = useState([]);
  const [activeTab, setActiveTab] = useState("lecturer"); // 'lecturer' | 'student'
  const [showModal, setShowModal] = useState(false);
  const [isPrivate, setIsPrivate] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [viewState, setViewState] = useState("list");
  const [activeCircle, setActiveCircle] = useState(null);

  const [formData, setFormData] = useState({
    circleName: "",
    module: "",
    description: "",
    circleType: "lecturer",
  });

  // Invite members
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteEmails, setInviteEmails] = useState([]);
  const [inviteStatus, setInviteStatus] = useState(""); // '' | 'sending' | 'done' | 'error'
  const [circleError, setCircleError] = useState(""); // inline error for create modal

  const token = localStorage.getItem("token");
  const baseUrl = "http://localhost:5000";

  React.useEffect(() => {
    fetchCircles();
  }, []);

  const fetchCircles = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${baseUrl}/api/lecturer-circles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        // Map backend document to frontend schema expectation
        const formatted = data.map((c) => ({
          ...c,
          id: c._id,
          role: c.circleType || "lecturer",
          students: c.members?.length || 1,
          moreAvatars: `+${Math.max(0, (c.members?.length || 1) - 3)}`,
        }));
        setCircles(formatted);
      }
    } catch (err) {
      console.error("Failed fetching circles:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleEditClick = (circle) => {
    setEditingId(circle._id);
    setFormData({
      circleName: circle.circleName || "",
      module:
        circle.courseCode && circle.courseName
          ? `${circle.courseCode} - ${circle.courseName}`
          : "",
      description: circle.description || "",
      circleType: circle.circleType || "lecturer",
    });
    setIsPrivate(circle.isPrivate !== undefined ? circle.isPrivate : true);
    setShowModal(true);
  };

  const handleViewDetails = (circle) => {
    setActiveCircle(circle);
    setViewState("details");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this circle?")) return;
    try {
      const res = await fetch(`${baseUrl}/api/lecturer-circles/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchCircles();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitCircle = async () => {
    if (!formData.circleName) return;

    const parsedModule = formData.module
      ? formData.module.split(" - ")
      : ["NEW101", "NEW MODULE"];

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `${baseUrl}/api/lecturer-circles/${editingId}`
        : `${baseUrl}/api/lecturer-circles`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseCode: parsedModule[0],
          courseName: parsedModule[1] || "Module",
          circleName: formData.circleName,
          circleType: formData.circleType,
          description: formData.description,
          isPrivate,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        // Fire invitations after circle is created
        if (inviteEmails.length > 0 && created._id) {
          await sendInvitations(created._id, inviteEmails);
        }
        fetchCircles();
        setShowModal(false);
        setCircleError("");
        setFormData({ circleName: "", module: "", description: "", circleType: "lecturer" });
        setInviteEmails([]);
        setInviteEmail("");
        setEditingId(null);
      } else {
        const errData = await res.json().catch(() => ({}));
        setCircleError(errData.message || "Failed to create circle. Please try again.");
      }
  } catch (err) { console.error(err); setCircleError("Network error. Please try again."); }
};

const addInviteEmail = () => {
  const email = inviteEmail.trim().toLowerCase();
  if (!email || inviteEmails.includes(email)) {
    setInviteEmail("");
    return;
  }
  setInviteEmails((prev) => [...prev, email]);
  setInviteEmail("");
};

const removeInviteEmail = (email) => {
  setInviteEmails((prev) => prev.filter((e) => e !== email));
};

const sendInvitations = async (circleId, emails) => {
  setInviteStatus("sending");
  try {
    await fetch(`${baseUrl}/api/lecturer-circles/${circleId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ emails }),
    });
    setInviteStatus("done");
  } catch (err) {
    console.error("Invite error:", err);
    setInviteStatus("error");
  }
};

  const getActivityColor = (type) => {
    switch (type) {
      case "high":
        return "text-emerald-500";
      case "moderate":
        return "text-amber-500";
      case "low":
        return "text-slate-400";
      default:
        return "text-emerald-500";
    }
  };

  const getActivityIndicator = (type) => {
    switch (type) {
      case "high":
        return "bg-emerald-500";
      case "moderate":
        return "bg-amber-500";
      case "low":
        return "bg-slate-300";
      default:
        return "bg-emerald-500";
    }
  };

  const displayedCircles = circles.filter((c) => c.role === activeTab);
  const activeCirclesCount = displayedCircles.length;
  const totalStudents = displayedCircles.reduce(
    (acc, c) => acc + (c.students || 0),
    0,
  );
  const highActivityCount = displayedCircles.filter(
    (c) => c.activityType === "high",
  ).length;
  const avgSize =
    activeCirclesCount > 0
      ? (totalStudents / activeCirclesCount).toFixed(1)
      : 0;
  const resourcesShared = activeCirclesCount * 12; // Standin value proportional to active tracking

  const exportReport = () => {
    const rows = displayedCircles.map((c) => ({
      courseCode: c.courseCode || "",
      courseName: c.courseName || "",
      circleName: c.circleName || "",
      description: c.description || "",
      members: c.students || (c.members ? c.members.length : 0),
      activity: c.activity || "",
      visibility: c.isPrivate ? "Private" : "Public",
      createdAt: c.createdAt ? new Date(c.createdAt).toLocaleString() : "",
    }));

    if (rows.length === 0) {
      alert("No circles to export.");
      return;
    }

    const keys = Object.keys(rows[0]);
    const csvLines = [keys.join(',')].concat(
      rows.map((r) => keys.map((k) => `"${String(r[k] || "").replace(/"/g, '""')}"`).join(',')),
    );
    const csv = csvLines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lecturer-circles-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto text-slate-800 pb-10">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm font-medium mb-3">
        <span className="text-slate-500">Dashboard</span>
        <span className="text-slate-400">&gt;</span>
        <span
          className={`cursor-pointer transition-colors ${viewState === "list" ? "text-teal-600" : "text-slate-500 hover:text-slate-700"}`}
          onClick={() => setViewState("list")}
        >
          My Circles
        </span>
        {viewState === "details" && activeCircle && (
          <>
            <span className="text-slate-400">&gt;</span>
            <span className="text-teal-600">{activeCircle.circleName}</span>
          </>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">
            My Circles
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Supervising 12 active study circles across 4 modules
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={exportReport} className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm">
            <Download className="w-[18px] h-[18px]" strokeWidth={2.5} />
            Export Report
          </button>
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({
                circleName: "",
                module: "",
                description: "",
                circleType: "lecturer",
              });
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm shadow-teal-500/20"
          >
            <Plus className="w-[18px] h-[18px]" strokeWidth={2.5} />
            New Circle
          </button>
        </div>
      </div>

      {viewState === "list" && (
        <>
          {/* Tabs */}
          <div className="flex items-center gap-8 border-b border-slate-200 mb-8">
            <button
              onClick={() => setActiveTab("lecturer")}
              className={`pb-4 text-[15px] font-extrabold transition-all relative ${activeTab === "lecturer" ? "text-teal-600" : "text-slate-400 hover:text-slate-600"}`}
            >
              Supervising Circles
              {activeTab === "lecturer" && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-teal-600 rounded-t-full"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("student")}
              className={`pb-4 text-[15px] font-extrabold transition-all relative ${activeTab === "student" ? "text-teal-600" : "text-slate-400 hover:text-slate-600"}`}
            >
              Enrolled Circles
              {activeTab === "student" && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-teal-600 rounded-t-full"></div>
              )}
            </button>
          </div>




          {/* Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-teal-600">
              <svg
                className="animate-spin h-8 w-8 text-teal-600"
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
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {circles
                .filter((c) => c.role === activeTab)
                .map((circle) => (
                  <div
                    key={circle.id}
                    className="bg-white rounded-[24px] p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-50 hover:shadow-md transition-shadow flex flex-col h-full"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-teal-50 text-teal-600 text-[10px] font-extrabold uppercase tracking-[0.08em] px-3 py-1 rounded-full">
                        {circle.courseCode} - {circle.courseName}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditClick(circle)}
                          className="text-slate-300 hover:text-blue-500 transition-colors p-1"
                          title="Edit Circle"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(circle._id)}
                          className="text-slate-300 hover:text-red-500 transition-colors p-1"
                          title="Delete Circle"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight">
                      {circle.circleName}
                    </h3>
                    <p className="text-[13px] text-slate-500 leading-relaxed font-medium mb-6 line-clamp-2">
                      {circle.description}
                    </p>

                    <div className="flex items-center gap-3 mb-8 mt-auto">
                      <div className="bg-slate-50 rounded-2xl p-3 flex-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                          Students
                        </p>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-[14px] h-[14px] text-teal-600 stroke-[2.5]" />
                          <span className="text-[13px] font-bold text-slate-800">
                            {circle.students}{" "}
                            <span className="text-slate-500">Members</span>
                          </span>
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-2xl p-3 flex-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                          Activity
                        </p>
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`w-2 h-2 rounded-full ${getActivityIndicator(circle.activityType)} shadow-sm`}
                          />
                          <span
                            className={`text-[13px] font-bold ${getActivityColor(circle.activityType)}`}
                          >
                            {circle.activity}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-teal-200 border-2 border-white -ml-0 z-30"></div>
                        <div className="w-8 h-8 rounded-full bg-amber-300 border-2 border-white -ml-3 z-20"></div>
                        <div className="relative w-8 h-8 rounded-full bg-orange-100 border-2 border-white -ml-3 z-10 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-teal-600">
                            {circle.moreAvatars}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewDetails(circle)}
                        className="bg-teal-50 hover:bg-teal-100 text-teal-600 px-5 py-2.5 rounded-[12px] text-[13px] font-bold transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}

              {/* Request Assignment Card */}
              {activeTab === "lecturer" && (
                <div className="bg-teal-50/50 rounded-[24px] p-6 border-2 border-dashed border-teal-200 flex flex-col items-center justify-center text-center h-full min-h-[300px] hover:bg-teal-50 transition-colors">
                  <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mb-4 border border-teal-200 shadow-sm">
                    <Plus className="w-6 h-6 text-teal-600" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-[17px] font-bold text-slate-900 mb-2">
                    Request Assignment
                  </h3>
                  <p className="text-[13px] text-slate-500 leading-relaxed font-medium mb-6 px-4">
                    Need more circles to supervise? Submit a request to the
                    department coordinator.
                  </p>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setFormData({ circleName: "", module: "", description: "", circleType: "lecturer" });
                      setShowModal(true);
                    }}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-[12px] text-[13px] font-bold transition-all shadow-sm shadow-teal-500/20"
                  >
                    Submit Request
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Bottom Summary Bar */}
          <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                Total Students
              </p>
              <p className="text-3xl font-extrabold text-teal-600">
                {totalStudents}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                High Activity
              </p>
              <p className="text-3xl font-extrabold text-emerald-500">
                {highActivityCount}{" "}
                <span className="text-lg font-bold">Circles</span>
              </p>
            </div>
            <div>
              <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                Avg. Size
              </p>
              <p className="text-3xl font-extrabold text-slate-900">
                {avgSize}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                Resources Shared
              </p>
              <p className="text-3xl font-extrabold text-slate-900">
                {resourcesShared}
              </p>
            </div>
          </div>
        </>
      )}

      {viewState === "details" && activeCircle && (
        <div className="animate-fade-in">
          <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-50 mb-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
              <div>
                <span className="bg-teal-50 text-teal-600 text-[10px] font-extrabold uppercase tracking-[0.08em] px-3 py-1 rounded-full mb-3 inline-block">
                  {activeCircle.courseCode} - {activeCircle.courseName}
                </span>
                <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
                  {activeCircle.circleName}
                </h2>
                <p className="text-sm text-slate-500 font-medium max-w-2xl">
                  {activeCircle.description}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleEditClick(activeCircle)}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-700 px-5 py-2.5 rounded-[12px] text-[13px] font-bold transition-colors border border-slate-200 shadow-sm flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" /> Edit Circle
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-50 rounded-2xl p-4 flex flex-col justify-center border border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Members
                </p>
                <p className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-teal-600" />{" "}
                  {activeCircle.students}
                </p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 flex flex-col justify-center border border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Activity
                </p>
                <p className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${getActivityIndicator(activeCircle.activityType)} shadow-sm`}
                  />
                  {activeCircle.activity}
                </p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 flex flex-col justify-center border border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Visibility
                </p>
                <p className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-teal-600" />{" "}
                  {activeCircle.isPrivate ? "Private" : "Public"}
                </p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 flex flex-col justify-center border border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Created
                </p>
                <p className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-teal-600" />{" "}
                  {new Date(activeCircle.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="bg-teal-50/50 rounded-2xl p-6 border-2 border-dashed border-teal-200">
              <h4 className="text-[15px] font-bold text-slate-900 mb-2">
                Circle Environment Data
              </h4>
              <p className="text-[13px] text-slate-500 font-medium mb-4">
                You are currently viewing specific runtime configurations for
                this Study Circle context. Live statistics bindings and
                assignment endpoints will be surfaced here.
              </p>
              <div className="flex flex-wrap bg-white rounded-lg p-3 border border-slate-100/60 w-max shadow-sm text-[13px] font-bold text-slate-600 gap-8">
                <span>Module: {activeCircle.courseCode}</span>
                <span>
                  Invite Code:{" "}
                  <span className="font-mono tracking-widest bg-slate-100 px-2 py-0.5 rounded leading-none">
                    {activeCircle.inviteCode || "ABC-123"}
                  </span>
                </span>
                <span className="capitalize">Role: {activeCircle.role}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create New Circle Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-[#f0f4f8] w-full max-w-3xl rounded-[24px] shadow-2xl overflow-hidden flex flex-col relative animate-scale-in">
            {/* Header */}
            <div className="px-10 pt-10 pb-6 relative">
              <span className="inline-block bg-teal-100 text-teal-700 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
                NEW INITIATIVE
              </span>
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-8 right-8 text-slate-400 hover:text-slate-700 transition-colors p-2 rounded-full hover:bg-slate-200"
              >
                <X className="w-5 h-5" strokeWidth={2.5} />
              </button>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                {editingId ? "Edit Circle" : "Create New Circle"}
              </h2>
              <p className="text-[14px] text-slate-500 font-medium">
                {editingId
                  ? "Update collaborative study environment settings."
                  : "Establish a new collaborative study environment for your modules."}
              </p>
            </div>

            {/* Body */}
            <div className="px-10 pb-8 flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-6 mb-8">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2.5">
                    Circle Name
                  </label>
                  <input
                    name="circleName"
                    value={formData.circleName}
                    onChange={handleInputChange}
                    type="text"
                    placeholder="e.g. Advanced Quantum Mechanics"
                    className="w-full bg-slate-200/50 border-none rounded-xl px-5 py-3.5 text-[14px] font-semibold text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500/30 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2.5">
                    Module / Subject
                  </label>
                  <input
                      type="text"
                      name="module"
                      value={formData.module}
                      onChange={handleInputChange}
                      placeholder="e.g. IT3010 NDM"
                      className="w-full bg-slate-200/50 border-none rounded-xl px-5 py-3.5 text-[14px] font-semibold text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500/30 outline-none transition-all"
                    />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2.5">
                    Circle Role
                  </label>
                  <div className="relative">
                    <select
                      name="circleType"
                      value={formData.circleType}
                      onChange={handleInputChange}
                      className="w-full bg-slate-200/50 border-none rounded-xl px-5 py-3.5 text-[14px] font-semibold text-slate-700 focus:ring-2 focus:ring-teal-500/30 outline-none appearance-none cursor-pointer transition-all"
                    >
                      <option value="lecturer">Lecturer (Supervising)</option>
                      <option value="student">Student (Participant)</option>
                    </select>
                    <ChevronDown
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                      strokeWidth={3}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2.5">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Define the goals and objectives of this circle..."
                  className="w-full bg-slate-200/50 border-none rounded-xl px-5 py-4 text-[14px] font-semibold text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500/30 outline-none resize-none transition-all"
                ></textarea>
              </div>

              {/* Visibility Box */}
              <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      <Lock
                        className="w-5 h-5 text-teal-700"
                        strokeWidth={2.5}
                      />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold text-slate-900 mb-0.5">
                        Circle Visibility
                      </h4>
                      <p className="text-[12px] text-slate-500 font-medium leading-tight">
                        Choose who can find and join this circle.
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-100 p-1.5 rounded-xl inline-flex shadow-sm shrink-0">
                    <button
                      onClick={() => setIsPrivate(false)}
                      className={`px-5 py-2 rounded-lg text-[13px] font-bold transition-all ${!isPrivate ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      Public
                    </button>
                    <button
                      onClick={() => setIsPrivate(true)}
                      className={`px-5 py-2 rounded-lg text-[13px] font-bold transition-all ${isPrivate ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      Private
                    </button>
                  </div>
                </div>

                {isPrivate && (
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-5 border-t border-slate-100 mt-2">
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">
                        Auto-Generated Invite Code
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="bg-[#E6F0F9] border border-[#d0e3F2] px-4 py-2.5 rounded-[10px] flex items-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                          <span className="text-[15px] font-extrabold text-slate-700 tracking-[0.15em] font-mono">
                            ABC-123-XYZ
                          </span>
                        </div>
                        <button className="p-2.5 rounded-[10px] bg-slate-100 hover:bg-slate-200 text-[#0F3F6E] transition-colors shadow-sm">
                          <Copy className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                    <div className="max-w-[200px]">
                      <p className="text-[11px] font-medium text-slate-500 italic leading-snug">
                        Only users with this code can request to join the
                        circle.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Initial Members */}
                <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
                  <div className="flex items-center gap-2 mb-4">
                    <UserPlus
                      className="w-4 h-4 text-teal-700"
                      strokeWidth={2.5}
                    />
                    <h4 className="text-[12px] font-bold text-slate-700 uppercase tracking-widest">
                      Initial Members
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInviteEmail())}
                      placeholder="Student or lecturer email..."
                      className="w-full bg-slate-100 border-none rounded-[10px] px-4 py-2.5 text-[13px] font-semibold text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500/30 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={addInviteEmail}
                      className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2.5 rounded-[10px] text-[13px] font-bold transition-colors shadow-sm shrink-0"
                    >
                      Add
                    </button>
                  </div>
                  {inviteEmails.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic">No members added yet. An invitation email will be sent to each address when you create the circle.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {inviteEmails.map((email) => (
                        <span key={email} className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 text-[12px] font-semibold px-3 py-1.5 rounded-full border border-teal-100">
                          {email}
                          <button type="button" onClick={() => removeInviteEmail(email)} className="text-teal-400 hover:text-teal-700">
                            <X className="w-3 h-3" strokeWidth={3} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* First Session */}
                <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar
                      className="w-4 h-4 text-teal-700"
                      strokeWidth={2.5}
                    />
                    <h4 className="text-[12px] font-bold text-slate-700 uppercase tracking-widest">
                      First Session
                    </h4>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="relative">
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full bg-slate-100 border-none rounded-[10px] px-4 py-2.5 text-[13px] font-semibold text-slate-700 focus:ring-2 focus:ring-teal-500/30 outline-none transition-all"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="time"
                        className="w-full bg-slate-100 border-none rounded-[10px] px-4 py-2.5 text-[13px] font-semibold text-slate-700 focus:ring-2 focus:ring-teal-500/30 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-10 py-6 border-t border-slate-200/50 flex flex-col sm:flex-row items-center justify-end gap-5 bg-slate-50/50">
              <button
                onClick={() => setShowModal(false)}
                className="text-[14px] font-bold text-slate-500 hover:text-slate-800 transition-colors w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitCircle}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-8 py-3.5 rounded-xl text-[14px] font-bold shadow-md shadow-teal-700/20 transition-all"
              >
                {editingId ? "Save Changes" : "Create Circle"}{" "}
                <ArrowRight className="w-4 h-4" strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
