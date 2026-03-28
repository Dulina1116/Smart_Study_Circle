import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Plus,
  X,
  Calendar,
  Clock,
  Link2,
  Users,
  Edit2,
  Trash2,
  AlertCircle,
  BookOpen,
  Target,
  GraduationCap,
  List,
  Grid,
  ExternalLink,
  Lock,
} from "lucide-react";

// ── Constants ──────────────────────────────────────────────────────────────

const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN ||
  `${window.location.protocol}//${window.location.hostname}:5000`;
const EVENTS_API = `${API_ORIGIN}/api/events`;

const EVENT_TYPES = {
  study_session: {
    label: "Study Session",
    color: "bg-blue-500",
    lightBg: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    dotColor: "bg-blue-500",
    icon: BookOpen,
    badgeClass: "bg-blue-100 text-blue-700 border border-blue-200",
  },
  deadline: {
    label: "Deadline",
    color: "bg-rose-500",
    lightBg: "bg-rose-50",
    textColor: "text-rose-700",
    borderColor: "border-rose-200",
    dotColor: "bg-rose-500",
    icon: Target,
    badgeClass: "bg-rose-100 text-rose-700 border border-rose-200",
  },
  exam: {
    label: "Exam",
    color: "bg-amber-500",
    lightBg: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    dotColor: "bg-amber-500",
    icon: GraduationCap,
    badgeClass: "bg-amber-100 text-amber-700 border border-amber-200",
  },
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

// ── Helpers ────────────────────────────────────────────────────────────────

const getAuthHeaders = () => {
  const token = (localStorage.getItem("token") || "").replace(/[\r\n"]/g, "");
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
};

// Returns the current logged-in user's ID from localStorage
const getCurrentUserId = () => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const u = JSON.parse(raw);
    return u?._id || u?.id || null;
  } catch {
    return null;
  }
};

// Detect meeting platform from URL
const getLinkPlatform = (url) => {
  if (!url) return null;
  const lower = url.toLowerCase();
  if (lower.includes("zoom.us")) return "Zoom";
  if (lower.includes("meet.google")) return "Google Meet";
  if (lower.includes("teams.microsoft")) return "Microsoft Teams";
  if (lower.includes("webex")) return "Webex";
  return "Meeting Link";
};

const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", hour12: true,
  });
};

const toLocalInputValue = (date) => {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const isSameDay = (a, b) => {
  const da = new Date(a), db = new Date(b);
  return da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate();
};

const isToday = (date) => isSameDay(date, new Date());

// ── Toast ────────────────────────────────────────────────────────────────

const Toast = ({ toasts, removeToast }) => (
  <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
    {toasts.map((t) => (
      <div
        key={t.id}
        className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-sm font-semibold animate-slide-up transition-all ${
          t.type === "success"
            ? "bg-emerald-500 text-white"
            : t.type === "error"
            ? "bg-rose-500 text-white"
            : "bg-gray-800 text-white"
        }`}
        style={{ minWidth: 220 }}
      >
        <span className="flex-1">{t.message}</span>
        <button onClick={() => removeToast(t.id)} className="opacity-70 hover:opacity-100 transition-opacity">
          <X className="w-4 h-4" />
        </button>
      </div>
    ))}
  </div>
);

const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);
  const remove = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);
  return { toasts, addToast: add, removeToast: remove };
};

// ── Confirm Dialog ──────────────────────────────────────────────────────

const ConfirmDialog = ({ open, title, message, onConfirm, onCancel, loading }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 animate-scale-in">
        <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center mb-4 mx-auto">
          <AlertCircle className="w-7 h-7 text-rose-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">{title}</h3>
        <p className="text-sm text-gray-500 text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-colors disabled:opacity-60"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── DateTimePicker ─────────────────────────────────────────────────────────
// value: "YYYY-MM-DDTHH:MM" string  |  onChange(newValue: string)
const DateTimePicker = ({ value, onChange, error }) => {
  const [calOpen, setCalOpen] = useState(false);

  // ── Parse the current value ──
  const parsed = (() => {
    if (!value) {
      const now = new Date();
      return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate(), hour: now.getHours(), minute: now.getMinutes() };
    }
    const [datePart, timePart = "12:00"] = value.split("T");
    const [y, m, d] = datePart.split("-").map(Number);
    const [h, min] = timePart.split(":").map(Number);
    return { year: y, month: m - 1, day: d, hour: h, minute: min };
  })();

  const [viewYear, setViewYear] = useState(parsed.year);
  const [viewMonth, setViewMonth] = useState(parsed.month);

  // Sync calendar view when external value changes (edit mode)
  useEffect(() => {
    if (value) {
      const [datePart] = value.split("T");
      const [y, m] = datePart.split("-").map(Number);
      setViewYear(y);
      setViewMonth(m - 1);
    }
  }, [value]);

  const emit = (year, month, day, hour, minute) => {
    const pad = (n) => String(n).padStart(2, "0");
    onChange(`${year}-${pad(month + 1)}-${pad(day)}T${pad(hour)}:${pad(minute)}`);
  };

  const selectDay = (day) => {
    emit(viewYear, viewMonth, day, parsed.hour, parsed.minute);
  };

  const adjustHour = (delta) => {
    // Toggle in 12h display: cycle 1→12 in the current AM/PM
    const isAM = parsed.hour < 12;
    let h12 = parsed.hour % 12 || 12;
    h12 += delta;
    if (h12 > 12) h12 = 1;
    if (h12 < 1) h12 = 12;
    const h24 = isAM ? (h12 === 12 ? 0 : h12) : (h12 === 12 ? 12 : h12 + 12);
    emit(parsed.year, parsed.month, parsed.day, h24, parsed.minute);
  };

  const adjustMinute = (delta) => {
    let m = parsed.minute + delta * 5;
    if (m >= 60) m = 0;
    if (m < 0) m = 55;
    emit(parsed.year, parsed.month, parsed.day, parsed.hour, m);
  };

  const toggleAMPM = () => {
    const h = parsed.hour < 12 ? parsed.hour + 12 : parsed.hour - 12;
    emit(parsed.year, parsed.month, parsed.day, h, parsed.minute);
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  // Calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const hour12 = parsed.hour % 12 || 12;
  const ampm = parsed.hour >= 12 ? "PM" : "AM";
  const minuteStr = String(parsed.minute).padStart(2, "0");

  // Display text
  const hasValue = !!value;
  const displayDate = hasValue
    ? new Date(value).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })
    : "Choose a date";
  const displayTime = hasValue
    ? `${hour12}:${minuteStr} ${ampm}`
    : "Choose time";

  return (
    <div>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setCalOpen((o) => !o)}
        className={`w-full flex items-center gap-3 px-4 py-3 border-2 rounded-xl transition-all text-left ${
          error
            ? "border-rose-400 bg-rose-50"
            : calOpen
            ? "border-blue-400 bg-blue-50/40"
            : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30"
        }`}
      >
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
          hasValue ? "bg-blue-100" : "bg-gray-100"
        }`}>
          <Calendar className={`w-4 h-4 ${hasValue ? "text-blue-600" : "text-gray-400"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold ${
            hasValue ? "text-gray-900" : "text-gray-400"
          }`}>{displayDate}</p>
          <p className={`text-xs mt-0.5 flex items-center gap-1 ${
            hasValue ? "text-blue-500 font-semibold" : "text-gray-400"
          }`}>
            <Clock className="w-3 h-3" />{displayTime}
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${
          calOpen ? "rotate-180" : ""
        }`} />
      </button>

      {/* Inline expandable picker */}
      {calOpen && (
        <div className="mt-2 bg-white border-2 border-blue-100 rounded-2xl overflow-hidden shadow-lg">

          {/* ── Month navigation ── */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600">
            <button
              type="button"
              onClick={prevMonth}
              className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold text-white">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* ── Day headers ── */}
          <div className="grid grid-cols-7 px-2 pt-2">
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
              <div key={d} className="text-center text-[10px] font-bold text-gray-400 py-1 uppercase">{d}</div>
            ))}
          </div>

          {/* ── Day cells ── */}
          <div className="grid grid-cols-7 px-2 pb-2">
            {cells.map((day, i) => {
              const isSelected =
                day === parsed.day &&
                viewMonth === parsed.month &&
                viewYear === parsed.year;
              const todayMark =
                day ? isToday(new Date(viewYear, viewMonth, day)) : false;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={!day}
                  onClick={() => day && selectDay(day)}
                  className={`h-8 w-full flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                    !day
                      ? "invisible"
                      : isSelected
                      ? "bg-blue-500 text-white shadow-sm"
                      : todayMark
                      ? "border-2 border-blue-300 text-blue-600"
                      : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* ── Time picker ── */}
          <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Time
            </p>
            <div className="flex items-center justify-center gap-3">

              {/* Hour */}
              <div className="flex flex-col items-center gap-1">
                <button
                  type="button"
                  onClick={() => adjustHour(1)}
                  className="w-8 h-6 rounded-lg bg-white border border-gray-200 hover:bg-blue-50 hover:border-blue-300 flex items-center justify-center transition-colors"
                >
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                </button>
                <div className="w-14 h-10 bg-white border-2 border-blue-200 rounded-xl flex items-center justify-center">
                  <span className="text-xl font-black text-blue-600">{String(hour12).padStart(2, "0")}</span>
                </div>
                <button
                  type="button"
                  onClick={() => adjustHour(-1)}
                  className="w-8 h-6 rounded-lg bg-white border border-gray-200 hover:bg-blue-50 hover:border-blue-300 flex items-center justify-center transition-colors"
                >
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <span className="text-2xl font-black text-gray-300 mb-0.5">:</span>

              {/* Minute */}
              <div className="flex flex-col items-center gap-1">
                <button
                  type="button"
                  onClick={() => adjustMinute(1)}
                  className="w-8 h-6 rounded-lg bg-white border border-gray-200 hover:bg-blue-50 hover:border-blue-300 flex items-center justify-center transition-colors"
                >
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                </button>
                <div className="w-14 h-10 bg-white border-2 border-blue-200 rounded-xl flex items-center justify-center">
                  <span className="text-xl font-black text-blue-600">{minuteStr}</span>
                </div>
                <button
                  type="button"
                  onClick={() => adjustMinute(-1)}
                  className="w-8 h-6 rounded-lg bg-white border border-gray-200 hover:bg-blue-50 hover:border-blue-300 flex items-center justify-center transition-colors"
                >
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* AM/PM */}
              <div className="flex flex-col gap-1 ml-1">
                <button
                  type="button"
                  onClick={() => parsed.hour >= 12 && toggleAMPM()}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${
                    ampm === "AM"
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-gray-500 border-gray-200 hover:border-blue-300"
                  }`}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => parsed.hour < 12 && toggleAMPM()}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${
                    ampm === "PM"
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-gray-500 border-gray-200 hover:border-blue-300"
                  }`}
                >
                  PM
                </button>
              </div>
            </div>

            {/* Quick minute presets */}
            <div className="flex gap-1.5 mt-3 justify-center">
              {[0, 15, 30, 45].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => emit(parsed.year, parsed.month, parsed.day, parsed.hour, m)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                    parsed.minute === m
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                  }`}
                >
                  :{String(m).padStart(2, "0")}
                </button>
              ))}
            </div>
          </div>

          {/* ── Done button ── */}
          <div className="px-4 pb-4 pt-0">
            <button
              type="button"
              onClick={() => setCalOpen(false)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold py-2.5 rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Event Form Modal ────────────────────────────────────────────────────

const EMPTY_FORM = {
  title: "",
  description: "",
  date: "",
  type: "study_session",
  link: "",
  circle: "",
};

const EventFormModal = ({ open, onClose, onSave, editEvent, prefilledDate, circles = [] }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const titleRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    if (editEvent) {
      setForm({
        title: editEvent.title || "",
        description: editEvent.description || "",
        date: editEvent.date ? toLocalInputValue(editEvent.date) : "",
        type: editEvent.type || "study_session",
        link: editEvent.location || "",
        circle: editEvent.circle?._id || editEvent.circle || "",
      });
    } else {
      const defaultDate = prefilledDate
        ? toLocalInputValue(prefilledDate)
        : toLocalInputValue(new Date());
      setForm({ ...EMPTY_FORM, date: defaultDate });
    }
    setErrors({});
    setTimeout(() => titleRef.current?.focus(), 100);
  }, [open, editEvent, prefilledDate]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.date) e.date = "Date is required";
    if (!form.type) e.type = "Event type is required";
    if (form.description.length > 500) e.description = "Max 500 characters";
    if (form.link && !/^https?:\/\/.+/.test(form.link.trim())) {
      e.link = "Please enter a valid URL (starting with http:// or https://)";
    }
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        date: new Date(form.date).toISOString(),
        type: form.type,
        location: form.link.trim(),
        circle: form.circle || null,
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      setErrors({ general: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: undefined, general: undefined }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9980] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="px-8 pt-8 pb-0 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {editEvent ? "Edit Event" : "New Event"}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {editEvent ? "Update the details below." : "Add a new event to your calendar."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5 max-h-[70vh] overflow-y-auto">
          {errors.general && (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-rose-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {errors.general}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              ref={titleRef}
              type="text"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="e.g. CS101 Group Study"
              className={`w-full border rounded-xl px-4 py-3 text-sm text-gray-900 outline-none transition-all focus:ring-2 focus:ring-blue-100 focus:border-blue-400 placeholder-gray-400 ${
                errors.title ? "border-rose-400 bg-rose-50" : "border-gray-200 bg-white"
              }`}
            />
            {errors.title && <p className="mt-1 text-xs text-rose-600">{errors.title}</p>}
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Event Type <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(EVENT_TYPES).map(([key, cfg]) => {
                const Icon = cfg.icon;
                const isSelected = form.type === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleChange("type", key)}
                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-xs font-bold transition-all ${
                      isSelected
                        ? `${cfg.lightBg} ${cfg.borderColor} ${cfg.textColor}`
                        : "border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Date & Time <span className="text-rose-500">*</span>
            </label>
            <DateTimePicker
              value={form.date}
              onChange={(v) => handleChange("date", v)}
              error={!!errors.date}
            />
            {errors.date && <p className="mt-1 text-xs text-rose-600">{errors.date}</p>}
          </div>

          {/* Description */}
          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-sm font-bold text-gray-700">Description</label>
              <span className={`text-xs ${form.description.length > 480 ? "text-rose-500" : "text-gray-400"}`}>
                {form.description.length}/500
              </span>
            </div>
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Add notes or details..."
              rows={3}
              className={`w-full border rounded-xl px-4 py-3 text-sm text-gray-900 outline-none transition-all focus:ring-2 focus:ring-blue-100 focus:border-blue-400 resize-none placeholder-gray-400 ${
                errors.description ? "border-rose-400 bg-rose-50" : "border-gray-200 bg-white"
              }`}
            />
            {errors.description && <p className="mt-1 text-xs text-rose-600">{errors.description}</p>}
          </div>

          {/* Meeting Link */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Meeting Link <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="url"
                value={form.link}
                onChange={(e) => handleChange("link", e.target.value)}
                placeholder="https://zoom.us/j/... or meet.google.com/..."
                className={`w-full border bg-white rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 outline-none transition-all focus:ring-2 focus:ring-blue-100 focus:border-blue-400 placeholder-gray-400 ${
                  errors.link ? "border-rose-400 bg-rose-50" : "border-gray-200"
                }`}
              />
            </div>
            {errors.link && <p className="mt-1 text-xs text-rose-600">{errors.link}</p>}
            <p className="mt-1.5 text-[11px] text-gray-400 flex items-center gap-1">
              <ExternalLink className="w-3 h-3" /> Supports Zoom, Google Meet, Microsoft Teams, Webex
            </p>
          </div>

          {/* Circle */}
          {circles.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-bold text-gray-700">
                  Study Circle <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                {form.circle && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                    <Lock className="w-2.5 h-2.5" /> Members only
                  </span>
                )}
              </div>
              <div className="relative">
                <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={form.circle}
                  onChange={(e) => handleChange("circle", e.target.value)}
                  className="w-full border border-gray-200 bg-white rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 outline-none transition-all focus:ring-2 focus:ring-blue-100 focus:border-blue-400 appearance-none"
                >
                  <option value="">No circle linked (visible to you only)</option>
                  {circles.map((c) => (
                    <option key={c.id || c._id} value={c.id || c._id}>
                      {c.subject} {c.moduleCode ? `(${c.moduleCode})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              {form.circle && (
                <p className="mt-1.5 text-[11px] text-amber-600 flex items-center gap-1 font-medium">
                  <Users className="w-3 h-3" /> Only members of this circle will see this event
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>{editEvent ? "Save Changes" : "Create Event"}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Event Detail Popover ────────────────────────────────────────────────

const EventDetail = ({ event, onEdit, onDelete, onClose, currentUserId }) => {
  const cfg = EVENT_TYPES[event.type] || EVENT_TYPES.study_session;
  const Icon = cfg.icon;

  // Resolve event owner ID — the API returns event.user as either an ID string or populated object
  const eventOwnerId =
    typeof event.user === "object" ? event.user?._id || event.user?.id : event.user;
  const isOwner = currentUserId && eventOwnerId &&
    String(currentUserId) === String(eventOwnerId);

  const platform = getLinkPlatform(event.location);

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-80 overflow-hidden animate-scale-in">
      <div className={`h-1.5 w-full ${cfg.color}`} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${cfg.badgeClass}`}>
              <Icon className="w-3 h-3" />
              {cfg.label}
            </span>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center flex-shrink-0 transition-colors">
            <X className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>
        <h3 className="font-bold text-gray-900 text-base mb-3 leading-snug">{event.title}</h3>
        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 flex-shrink-0 text-gray-400" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 flex-shrink-0 text-gray-400" />
            <span>{formatTime(event.date)}</span>
          </div>
          {event.location && (
            <div className="flex items-start gap-2">
              <Link2 className="w-4 h-4 flex-shrink-0 text-gray-400 mt-0.5" />
              <a
                href={event.location}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-blue-600 hover:text-blue-700 hover:underline text-xs font-semibold flex items-center gap-1 break-all"
              >
                {platform}
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
            </div>
          )}
          {event.circle?.subject && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 flex-shrink-0 text-gray-400" />
              <span className="line-clamp-1">{event.circle.subject}</span>
            </div>
          )}
          {event.description && (
            <p className="text-xs text-gray-500 bg-gray-50 rounded-xl p-3 mt-2 leading-relaxed">
              {event.description}
            </p>
          )}
        </div>

        {/* Owner-only actions */}
        {isOwner ? (
          <div className="flex gap-2 mt-4">
            <button
              onClick={onEdit}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              onClick={onDelete}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-1.5 justify-center text-[11px] text-gray-400">
            <Lock className="w-3 h-3" />
            Only the creator can edit or delete this event
          </div>
        )}
      </div>
    </div>
  );
};

// ── Sidebar Upcoming Events ─────────────────────────────────────────────

const UpcomingEventList = ({ events, onEventClick, onAddEvent }) => {
  const upcoming = events
    .filter((e) => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 8);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-900">Upcoming Events</h3>
        <button
          onClick={onAddEvent}
          className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {upcoming.length === 0 ? (
        <div className="text-center py-6">
          <Calendar className="w-8 h-8 text-gray-200 mx-auto mb-2" />
          <p className="text-xs text-gray-400">No upcoming events</p>
        </div>
      ) : (
        <div className="space-y-2">
          {upcoming.map((event) => {
            const cfg = EVENT_TYPES[event.type] || EVENT_TYPES.study_session;
            const Icon = cfg.icon;
            return (
              <button
                key={event._id}
                onClick={() => onEventClick(event)}
                className="w-full text-left flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div className={`w-1.5 h-8 rounded-full flex-shrink-0 ${cfg.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {event.title}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {formatDate(event.date)} · {formatTime(event.date)}
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${cfg.lightBg} ${cfg.textColor} flex-shrink-0`}>
                  {cfg.label.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Month Calendar Grid ─────────────────────────────────────────────────

const MonthView = ({ year, month, events, selectedDay, onDayClick, onEventClick }) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];

  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  // pad to full rows
  while (cells.length % 7 !== 0) cells.push(null);

  const getEventsForDay = (day) => {
    if (!day) return [];
    return events.filter((e) => isSameDay(e.date, new Date(year, month, day)));
  };

  return (
    <div className="flex-1 overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {DAY_NAMES.map((d) => (
          <div key={d} className="py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 flex-1" style={{ gridAutoRows: "1fr" }}>
        {cells.map((day, idx) => {
          const dayEvents = getEventsForDay(day);
          const today = day ? isToday(new Date(year, month, day)) : false;
          const isSelected = day && selectedDay?.getDate() === day &&
            selectedDay?.getMonth() === month &&
            selectedDay?.getFullYear() === year;

          return (
            <div
              key={idx}
              onClick={() => day && onDayClick(new Date(year, month, day))}
              className={`border-b border-r border-gray-50 p-1.5 min-h-[90px] cursor-pointer transition-colors group
                ${day ? "hover:bg-blue-50/40" : "bg-gray-50/30"}
                ${isSelected ? "bg-blue-50/60" : ""}
              `}
            >
              {day && (
                <>
                  <div className="flex items-start justify-between mb-1">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 text-xs font-bold rounded-full transition-colors
                        ${today ? "bg-blue-500 text-white shadow-md" : isSelected ? "bg-blue-100 text-blue-700" : "text-gray-700 group-hover:bg-blue-100 group-hover:text-blue-700"}
                      `}
                    >
                      {day}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map((ev) => {
                      const cfg = EVENT_TYPES[ev.type] || EVENT_TYPES.study_session;
                      return (
                        <button
                          key={ev._id}
                          onClick={(e) => { e.stopPropagation(); onEventClick(ev); }}
                          className={`w-full text-left text-[10px] font-semibold px-1.5 py-0.5 rounded-md truncate ${cfg.color} text-white opacity-90 hover:opacity-100 transition-opacity`}
                          title={ev.title}
                        >
                          {ev.title}
                        </button>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <span className="text-[10px] text-gray-400 font-semibold pl-1">
                        +{dayEvents.length - 3} more
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Week View ───────────────────────────────────────────────────────────

const WeekView = ({ currentDate, events, onEventClick, onDayClick }) => {
  const startOfWeek = new Date(currentDate);
  const dayOfWeek = startOfWeek.getDay();
  startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="flex-1 overflow-hidden">
      <div className="grid grid-cols-7 border-b border-gray-100">
        {days.map((day, i) => {
          const today = isToday(day);
          const dayEvents = events.filter((e) => isSameDay(e.date, day));
          return (
            <div
              key={i}
              className="border-r border-gray-50 last:border-r-0 cursor-pointer hover:bg-blue-50/30 transition-colors"
              onClick={() => onDayClick(day)}
            >
              <div className={`py-3 text-center border-b border-gray-50`}>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">{DAY_NAMES[day.getDay()]}</p>
                <span className={`inline-flex w-8 h-8 items-center justify-center rounded-full text-sm font-bold mx-auto
                  ${today ? "bg-blue-500 text-white" : "text-gray-700"}`}>
                  {day.getDate()}
                </span>
              </div>
              <div className="p-1.5 space-y-1 min-h-[200px]">
                {dayEvents.map((ev) => {
                  const cfg = EVENT_TYPES[ev.type] || EVENT_TYPES.study_session;
                  return (
                    <button
                      key={ev._id}
                      onClick={(e) => { e.stopPropagation(); onEventClick(ev); }}
                      className={`w-full text-left text-[10px] font-semibold px-2 py-1.5 rounded-lg ${cfg.color} text-white opacity-90 hover:opacity-100 transition-opacity`}
                    >
                      <div className="truncate">{ev.title}</div>
                      <div className="opacity-80 mt-0.5">{formatTime(ev.date)}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Day View ────────────────────────────────────────────────────────────

const DayView = ({ currentDate, events, onEventClick, onAddEvent }) => {
  const dayEvents = events
    .filter((e) => isSameDay(e.date, currentDate))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {currentDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </h3>
            {isToday(currentDate) && (
              <span className="text-xs font-bold text-blue-500">Today</span>
            )}
          </div>
          <button
            onClick={() => onAddEvent(currentDate)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Event
          </button>
        </div>

        {dayEvents.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
            <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-400">No events on this day</p>
            <p className="text-xs text-gray-300 mt-1">Click "Add Event" to create one</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dayEvents.map((ev) => {
              const cfg = EVENT_TYPES[ev.type] || EVENT_TYPES.study_session;
              const Icon = cfg.icon;
              return (
                <button
                  key={ev._id}
                  onClick={() => onEventClick(ev)}
                  className={`w-full text-left flex items-start gap-4 p-4 rounded-2xl border-l-4 ${cfg.borderColor} bg-white shadow-sm hover:shadow-md transition-all border border-gray-100 group`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.lightBg}`}>
                    <Icon className={`w-5 h-5 ${cfg.textColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{ev.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(ev.date)}</span>
                      {ev.location && (
                        <span className="flex items-center gap-1 text-blue-500 font-semibold">
                          <Link2 className="w-3 h-3" />{getLinkPlatform(ev.location)}
                        </span>
                      )}
                    </div>
                    {ev.description && <p className="text-xs text-gray-400 mt-1.5 line-clamp-2">{ev.description}</p>}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg flex-shrink-0 ${cfg.badgeClass}`}>{cfg.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main CalendarView ───────────────────────────────────────────────────

export default function CalendarView({ circles = [] }) {
  const currentUserId = getCurrentUserId();
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [viewMode, setViewMode] = useState("month"); // month | week | day
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [formOpen, setFormOpen] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [prefilledDate, setPrefilledDate] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  // Detail popover
  const [detailEvent, setDetailEvent] = useState(null);
  const [detailPos, setDetailPos] = useState({ x: 0, y: 0 });
  const detailRef = useRef(null);

  // Confirm delete
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { toasts, addToast, removeToast } = useToast();

  // ── Fetch ──

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch a wide range (±3 months) to support week/day navigation without refetching
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0, 23, 59, 59);
      const url = `${EVENTS_API}?start=${start.toISOString()}&end=${end.toISOString()}`;
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to fetch events");
      const data = await res.json();
      setEvents(Array.isArray(data.events) ? data.events : []);
    } catch (err) {
      addToast(err.message || "Failed to load events", "error");
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // Close detail on outside click
  useEffect(() => {
    if (!detailEvent) return;
    const handler = (e) => {
      if (detailRef.current && !detailRef.current.contains(e.target)) {
        setDetailEvent(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [detailEvent]);

  // ── Navigation ──

  const navigate = (dir) => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (viewMode === "month") d.setMonth(d.getMonth() + dir);
      else if (viewMode === "week") d.setDate(d.getDate() + dir * 7);
      else d.setDate(d.getDate() + dir);
      return d;
    });
    setDetailEvent(null);
  };

  const goToday = () => { setCurrentDate(new Date()); setDetailEvent(null); };

  // ── Label ──

  const getNavLabel = () => {
    if (viewMode === "month") {
      return `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
    if (viewMode === "week") {
      const start = new Date(currentDate);
      start.setDate(start.getDate() - start.getDay());
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    }
    return currentDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  };

  // ── Handlers ──

  const handleDayClick = (date) => {
    setSelectedDay(date);
    if (viewMode === "month") {
      setPrefilledDate(date);
      setEditEvent(null);
      setFormOpen(true);
    } else {
      setCurrentDate(date);
    }
  };

  const handleEventClick = (ev) => {
    setDetailEvent(ev);
  };

  const handleAddEvent = (date) => {
    setPrefilledDate(date || currentDate);
    setEditEvent(null);
    setDetailEvent(null);
    setFormOpen(true);
  };

  const handleEditEvent = (ev) => {
    setDetailEvent(null);
    setEditEvent(ev);
    setPrefilledDate(null);
    setFormOpen(true);
  };

  const handleDeleteClick = (ev) => {
    setDetailEvent(null);
    setDeleteTarget(ev);
  };

  const handleSave = async (payload) => {
    if (editEvent) {
      const res = await fetch(`${EVENTS_API}/${editEvent._id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update event");
      setEvents((prev) => prev.map((e) => (e._id === editEvent._id ? data.event : e)));
      addToast("Event updated successfully!", "success");
    } else {
      const res = await fetch(EVENTS_API, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create event");
      setEvents((prev) => [...prev, data.event]);
      addToast("Event created successfully!", "success");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`${EVENTS_API}/${deleteTarget._id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete event");
      }
      setEvents((prev) => prev.filter((e) => e._id !== deleteTarget._id));
      addToast("Event deleted.", "success");
      setDeleteTarget(null);
    } catch (err) {
      addToast(err.message || "Failed to delete", "error");
    } finally {
      setDeleting(false);
    }
  };

  // ── Render ──

  return (
    <div className="flex-1 overflow-hidden bg-gray-50/50 flex">
      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between gap-4 flex-shrink-0">
          {/* Left: Nav */}
          <div className="flex items-center gap-3">
            <button
              onClick={goToday}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Today
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate(-1)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate(1)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <h2 className="text-base font-bold text-gray-900 min-w-[180px]">{getNavLabel()}</h2>
          </div>

          {/* Center: View toggle */}
          <div className="hidden md:flex items-center bg-gray-100 rounded-xl p-1 gap-1">
            {[
              { key: "month", label: "Month", icon: Grid },
              { key: "week", label: "Week", icon: List },
              { key: "day", label: "Day", icon: Calendar },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setViewMode(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  viewMode === key
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Right: Add button + loading */}
          <div className="flex items-center gap-3">
            {loading && (
              <svg className="w-4 h-4 animate-spin text-gray-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            <button
              onClick={() => handleAddEvent(null)}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm shadow-blue-200"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Event</span>
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white border-b border-gray-50 px-6 py-2 flex items-center gap-4 flex-shrink-0">
          {Object.entries(EVENT_TYPES).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${cfg.color}`} />
              <span className="text-xs text-gray-500 font-medium">{cfg.label}</span>
            </div>
          ))}
        </div>

        {/* Calendar Body */}
        <div className="flex-1 overflow-hidden bg-white relative">
          {viewMode === "month" && (
            <MonthView
              year={currentDate.getFullYear()}
              month={currentDate.getMonth()}
              events={events}
              selectedDay={selectedDay}
              onDayClick={handleDayClick}
              onEventClick={handleEventClick}
            />
          )}
          {viewMode === "week" && (
            <WeekView
              currentDate={currentDate}
              events={events}
              onEventClick={handleEventClick}
              onDayClick={(d) => { setCurrentDate(d); setViewMode("day"); }}
            />
          )}
          {viewMode === "day" && (
            <DayView
              currentDate={currentDate}
              events={events}
              onEventClick={handleEventClick}
              onAddEvent={handleAddEvent}
            />
          )}

          {/* Event Detail Popover */}
          {detailEvent && (
            <div
              ref={detailRef}
              className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <div className="pointer-events-auto">
                <EventDetail
                  event={detailEvent}
                  currentUserId={currentUserId}
                  onEdit={() => handleEditEvent(detailEvent)}
                  onDelete={() => handleDeleteClick(detailEvent)}
                  onClose={() => setDetailEvent(null)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="hidden xl:flex flex-col w-72 border-l border-gray-100 bg-white p-4 gap-4 overflow-y-auto">
        {/* Mini calendar month indicator */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white">
          <p className="text-xs font-bold opacity-80 uppercase tracking-wider mb-0.5">
            {MONTH_NAMES[currentDate.getMonth()]}
          </p>
          <p className="text-3xl font-black">{currentDate.getFullYear()}</p>
          <div className="mt-3 pt-3 border-t border-white/20">
            <p className="text-xs opacity-80">
              {events.filter((e) => {
                const d = new Date(e.date);
                return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
              }).length} events this month
            </p>
          </div>
        </div>

        {/* Type summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
            This Month
          </h4>
          <div className="space-y-2.5">
            {Object.entries(EVENT_TYPES).map(([key, cfg]) => {
              const Icon = cfg.icon;
              const count = events.filter((e) => {
                const d = new Date(e.date);
                return e.type === key &&
                  d.getMonth() === currentDate.getMonth() &&
                  d.getFullYear() === currentDate.getFullYear();
              }).length;
              return (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${cfg.lightBg}`}>
                      <Icon className={`w-3.5 h-3.5 ${cfg.textColor}`} />
                    </div>
                    <span className="text-xs font-semibold text-gray-600">{cfg.label}</span>
                  </div>
                  <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${count > 0 ? cfg.badgeClass : "bg-gray-100 text-gray-400"}`}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming list */}
        <UpcomingEventList
          events={events}
          onEventClick={handleEventClick}
          onAddEvent={() => handleAddEvent(null)}
        />
      </div>

      {/* Modals */}
      <EventFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditEvent(null); }}
        onSave={handleSave}
        editEvent={editEvent}
        prefilledDate={prefilledDate}
        circles={circles}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Event"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
