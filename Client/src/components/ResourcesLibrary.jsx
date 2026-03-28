import React, { useState, useEffect } from "react";
import {
  Download,
  Eye,
  Grid,
  List,
  Plus,
  Search,
  X,
  AlertCircle,
  Folder,
  Pencil,
  Trash2,
  BookOpen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN ||
  `${window.location.protocol}//${window.location.hostname}:5000`;
const API_BASE = `${API_ORIGIN}/api/resources`;

const getAuthHeaders = () => {
  const token = (localStorage.getItem("token") || "").replace(/[\r\n"]/g, "");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const getCategoryLabel = (category) => {
  const labels = {
    "lecture-notes": "Lecture Notes",
    "past-papers": "Past Papers",
    summaries: "Student Summaries",
    handout: "Handout",
    other: "Other",
  };
  return labels[category] || category;
};

const getCategoryStyle = (category) => {
  const styles = {
    "lecture-notes": "bg-[var(--dash-accent-soft)] text-[var(--dash-accent)] border-[rgba(15,118,110,0.25)]",
    "past-papers": "bg-amber-50 text-amber-700 border-amber-100",
    summaries: "bg-emerald-50 text-emerald-700 border-emerald-100",
    handout: "bg-sky-50 text-sky-700 border-sky-100",
    other: "bg-slate-50 text-slate-700 border-slate-100",
  };
  return styles[category] || styles.other;
};

const getCategoryFolderStyle = (category) => {
  const styles = {
    "lecture-notes": "bg-[var(--dash-accent-soft)] text-[var(--dash-accent)]",
    "past-papers": "bg-amber-100 text-amber-700",
    summaries: "bg-emerald-100 text-emerald-700",
    handout: "bg-sky-100 text-sky-700",
    other: "bg-slate-100 text-slate-700",
  };
  return styles[category] || styles.other;
};

const getTypeIcon = (type) => {
  const icons = {
    pdf: "📄",
    document: "📝",
    presentation: "📊",
    video: "🎬",
    link: "🔗",
    other: "📦",
  };
  return icons[type] || "📦";
};

// Maps each resource type to allowed file extensions and the browser accept string
const ACCEPTED_FILES = {
  pdf:          { exts: [".pdf"],                          accept: ".pdf" },
  document:     { exts: [".doc", ".docx", ".txt", ".odt"], accept: ".doc,.docx,.txt,.odt" },
  presentation: { exts: [".ppt", ".pptx", ".odp"],       accept: ".ppt,.pptx,.odp" },
  video:        { exts: [".mp4", ".mov", ".avi", ".mkv", ".webm"], accept: "video/*" },
  other:        { exts: [],                                accept: "*" },
};

const getAcceptAttr = (type) => ACCEPTED_FILES[type]?.accept ?? "*";

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function ResourcesLibrary({ user }) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("grid");
  const [resources, setResources] = useState([]);
  const [featuredResources, setFeaturedResources] = useState([]);
  const [categories, setCategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    category: "other",
    type: "pdf",
    externalLink: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadErrors, setUploadErrors] = useState({ title: "", externalLink: "", file: "" });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    category: "other",
    type: "pdf",
    externalLink: "",
  });
  const [editFile, setEditFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editErrors, setEditErrors] = useState({ title: "", externalLink: "" });
  const [deletingId, setDeletingId] = useState("");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailResource, setDetailResource] = useState(null);

  const storedUser = (() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();
  const currentUserId = String(
    user?._id || user?.id || storedUser?._id || storedUser?.id || "",
  );

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [featuredRes, categoriesRes, resourcesRes] = await Promise.all([
        fetch(`${API_BASE}/featured`),
        fetch(`${API_BASE}/categories`),
        fetch(`${API_BASE}?limit=20`),
      ]);

      if (featuredRes.ok) {
        const data = await featuredRes.json();
        setFeaturedResources(data);
      }

      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(data);
      }

      if (resourcesRes.ok) {
        const data = await resourcesRes.json();
        setResources(data.resources);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = async (categoryId) => {
    setSelectedCategory(categoryId);
    try {
      const res = await fetch(`${API_BASE}/category/${categoryId}`);
      if (res.ok) {
        const data = await res.json();
        setResources(data.resources);
      }
    } catch (err) {
      console.error("Error fetching category:", err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      fetchInitialData();
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}?search=${encodeURIComponent(searchTerm)}`,
      );
      if (res.ok) {
        const data = await res.json();
        setResources(data.resources);
      }
    } catch (err) {
      console.error("Error searching:", err);
    }
  };

  const validateUploadForm = () => {
    const errors = { title: "", externalLink: "", file: "" };
    const title = uploadForm.title.trim();
    if (!title) {
      errors.title = "Title is required.";
    } else if (title.length < 3) {
      errors.title = "Title must be at least 3 characters.";
    } else if (title.length > 100) {
      errors.title = "Title must be 100 characters or fewer.";
    }
    if (uploadForm.type === "link") {
      const link = uploadForm.externalLink.trim();
      if (!link) {
        errors.externalLink = "A URL is required for link-type resources.";
      } else if (!/^https?:\/\/.+/.test(link)) {
        errors.externalLink = "URL must start with http:// or https://.";
      }
    } else {
      if (!selectedFile) {
        errors.file = "Please select a file to upload.";
      } else {
        const allowed = ACCEPTED_FILES[uploadForm.type];
        if (allowed && allowed.exts.length > 0) {
          const ext = "." + selectedFile.name.split(".").pop().toLowerCase();
          if (!allowed.exts.includes(ext)) {
            const typeLabel = uploadForm.type.charAt(0).toUpperCase() + uploadForm.type.slice(1);
            errors.file = `${typeLabel} type only accepts: ${allowed.exts.join(", ")} files.`;
          }
        }
      }
    }
    return errors;
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const errors = validateUploadForm();
    if (errors.title || errors.externalLink || errors.file) {
      setUploadErrors(errors);
      return;
    }
    setUploadErrors({ title: "", externalLink: "", file: "" });

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("title", uploadForm.title.trim());
      formData.append("description", uploadForm.description.trim());
      formData.append("category", uploadForm.category);
      formData.append("type", uploadForm.type);
      if (uploadForm.type === "link" && uploadForm.externalLink) {
        formData.append("externalLink", uploadForm.externalLink.trim());
      }
      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const token = localStorage.getItem("token")?.replace(/[\r\n"]/g, "");
      const res = await fetch(`${API_BASE}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        setShowUploadModal(false);
        setUploadForm({
          title: "",
          description: "",
          category: "other",
          type: "pdf",
          externalLink: "",
        });
        setSelectedFile(null);
        setUploadErrors({ title: "", externalLink: "", file: "" });
        fetchInitialData();
      } else {
        const error = await res.json();
        setUploadErrors((prev) => ({ ...prev, title: error.message || "Failed to upload resource." }));
      }
    } catch (err) {
      console.error("Upload error:", err);
      setUploadErrors((prev) => ({ ...prev, title: "An unexpected error occurred. Please try again." }));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (resource) => {
    const resourceId = resource._id || resource.id;
    navigate(`/resources/preview/${resourceId}`);
  };

  const getUploaderId = (resource) => {
    const uploadedBy = resource?.uploadedBy;
    if (!uploadedBy) return "";
    if (typeof uploadedBy === "string") return String(uploadedBy);
    return String(uploadedBy._id || uploadedBy.id || "");
  };

  const canManageResource = (resource) => {
    return Boolean(currentUserId) && getUploaderId(resource) === currentUserId;
  };

  const openEditModal = (resource) => {
    setEditingResource(resource);
    setEditForm({
      title: resource.title || "",
      description: resource.description || "",
      category: resource.category || "other",
      type: resource.type || "other",
      externalLink: resource.externalLink || "",
    });
    setEditFile(null);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingResource(null);
    setEditFile(null);
    setEditForm({
      title: "",
      description: "",
      category: "other",
      type: "pdf",
      externalLink: "",
    });
  };

  const validateEditForm = () => {
    const errors = { title: "", externalLink: "" };
    const title = editForm.title.trim();
    if (!title) {
      errors.title = "Title is required.";
    } else if (title.length < 3) {
      errors.title = "Title must be at least 3 characters.";
    } else if (title.length > 100) {
      errors.title = "Title must be 100 characters or fewer.";
    }
    if (editForm.type === "link") {
      const link = editForm.externalLink.trim();
      if (!link) {
        errors.externalLink = "A URL is required for link-type resources.";
      } else if (!/^https?:\/\/.+/.test(link)) {
        errors.externalLink = "URL must start with http:// or https://.";
      }
    }
    return errors;
  };

  const handleUpdateResource = async (e) => {
    e.preventDefault();
    if (!editingResource) return;

    const errors = validateEditForm();
    if (errors.title || errors.externalLink) {
      setEditErrors(errors);
      return;
    }
    setEditErrors({ title: "", externalLink: "" });

    setIsEditing(true);
    try {
      const formData = new FormData();
      formData.append("title", editForm.title.trim());
      formData.append("description", editForm.description.trim());
      formData.append("category", editForm.category);
      formData.append("type", editForm.type);
      formData.append("externalLink", editForm.externalLink.trim());
      if (editFile) {
        formData.append("file", editFile);
      }

      const token = localStorage.getItem("token")?.replace(/[\r\n"]/g, "");
      const resourceId = editingResource._id || editingResource.id;
      const res = await fetch(`${API_BASE}/${resourceId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setEditErrors((prev) => ({ ...prev, title: data.message || "Failed to update resource." }));
        return;
      }

      closeEditModal();
      fetchInitialData();
    } catch (err) {
      console.error("Update resource error:", err);
      setEditErrors((prev) => ({ ...prev, title: err.message || "An unexpected error occurred." }));
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteResource = async (resource) => {
    const resourceId = resource._id || resource.id;
    const ok = window.confirm(
      "Delete this resource? This action cannot be undone.",
    );
    if (!ok) return;

    setDeletingId(String(resourceId));
    try {
      const token = localStorage.getItem("token")?.replace(/[\r\n"]/g, "");
      const res = await fetch(`${API_BASE}/${resourceId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to delete resource");
      }

      fetchInitialData();
    } catch (err) {
      console.error("Delete resource error:", err);
      window.alert(err.message || "Error deleting resource");
    } finally {
      setDeletingId("");
    }
  };

  const openDetailsModal = (resource) => {
    setDetailResource(resource);
    setShowDetailsModal(true);
  };

  return (
    <div className="relative flex-1 overflow-y-auto overflow-x-hidden bg-[var(--dash-bg)] p-8">
      <div className="pointer-events-none absolute -top-24 -right-20 h-72 w-72 rounded-full bg-[rgba(245,158,11,0.22)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-[rgba(15,118,110,0.18)] blur-3xl" />
      <div className="relative max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-[28px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 md:p-8 shadow-[0_18px_36px_rgba(31,41,51,0.08)]">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[rgba(15,118,110,0.18)] blur-3xl" />
          <div className="absolute -left-20 -bottom-20 h-48 w-48 rounded-full bg-[rgba(245,158,11,0.2)] blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center rounded-full border border-[var(--dash-border)] bg-[var(--dash-surface-2)] px-3 py-1 text-xs font-bold tracking-wide text-[var(--dash-accent)] mb-3">
                <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                RESOURCE HUB
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--dash-ink)] tracking-tight mb-2 font-head">
                Resources Library
              </h1>
              <p className="text-[var(--dash-muted)]">
                Access study materials, notes, readings, and curated resources
                in one place.
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-[linear-gradient(135deg,#0f766e,#14b8a6)] hover:brightness-110 text-white font-semibold px-4 py-2.5 rounded-xl text-sm flex items-center transition-colors shadow-[0_12px_26px_rgba(15,118,110,0.35)]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Upload Resource
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-2"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search resources..."
              className="w-full bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-xl py-2.5 pl-10 pr-4 text-sm text-[var(--dash-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--dash-accent-soft)]"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-[var(--dash-accent)] hover:bg-[var(--dash-accent-strong)] text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
            >
              Search
            </button>
            {selectedCategory ? (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory(null);
                  fetchInitialData();
                }}
                className="bg-[var(--dash-surface-2)] hover:bg-[rgba(15,118,110,0.1)] text-[var(--dash-ink)] font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
              >
                Clear Filter
              </button>
            ) : null}
          </div>
        </form>

        {/* Featured Resources */}
        {featuredResources.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-[var(--dash-ink)] mb-4 font-head">
              Featured Resources
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredResources.slice(0, 3).map((resource) => (
                <div
                  key={resource._id}
                  className="bg-[var(--dash-surface)] rounded-2xl p-6 border border-[var(--dash-border)] shadow-[0_18px_32px_rgba(31,41,51,0.08)] hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">
                      {getTypeIcon(resource.type)}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[var(--dash-surface-2)] text-[var(--dash-accent)] border border-[var(--dash-border)]">
                      FEATURED
                    </span>
                  </div>
                  <h3 className="font-bold text-[var(--dash-ink)] mb-2 line-clamp-2">
                    {resource.title}
                  </h3>
                  <p className="text-xs text-[var(--dash-muted)] mb-4 line-clamp-2">
                    {resource.description || "No description added yet."}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-[var(--dash-muted)]">
                    <span
                      className={`px-2 py-0.5 rounded-full border ${getCategoryStyle(resource.category)}`}
                    >
                      {getCategoryLabel(resource.category)}
                    </span>
                    {resource.type === "video" && resource.duration && (
                      <span>• {resource.duration}</span>
                    )}
                    {resource.type === "pdf" && resource.fileSize > 0 && (
                      <span>• {formatFileSize(resource.fileSize)}</span>
                    )}
                  </div>
                  {resource.filePath && (
                    <button
                      onClick={() => handleDownload(resource)}
                      className="mt-4 w-full bg-[var(--dash-accent-soft)] hover:bg-[rgba(15,118,110,0.2)] text-[var(--dash-accent)] text-xs font-semibold py-2 rounded-lg transition-colors"
                    >
                      <Download className="w-3 h-3 inline mr-1" /> Download
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Categories */}
        {Object.keys(categories).length > 0 && (
          <section>
            <h3 className="text-sm uppercase tracking-[0.2em] text-[var(--dash-muted)] font-bold mb-3">
              Categories
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(categories).map(([catId, catInfo]) => (
                <button
                  key={catId}
                  onClick={() => handleCategorySelect(catId)}
                  className={`group relative overflow-hidden rounded-2xl p-5 text-left border transition-all duration-200 ${
                    selectedCategory === catId
                      ? "bg-[var(--dash-accent-soft)] border-[rgba(15,118,110,0.3)] shadow-[0_16px_28px_rgba(15,118,110,0.18)]"
                      : "bg-[var(--dash-surface)] border-[var(--dash-border)] hover:border-[rgba(15,118,110,0.25)] hover:shadow-[0_16px_28px_rgba(31,41,51,0.08)]"
                  }`}
                >
                  <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[rgba(245,158,11,0.12)] blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 ${getCategoryFolderStyle(catId)} transition-transform duration-300 group-hover:-translate-y-1`}
                  >
                    <Folder className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-[26px] sm:text-[28px] text-[var(--dash-ink)] leading-tight font-head">
                    {catInfo.label}
                  </p>
                  <p className="text-sm text-[var(--dash-muted)] mt-1">
                    {catInfo.count} files
                  </p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* View Toggle */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-[var(--dash-muted)] font-medium">
            {selectedCategory
              ? `Showing: ${getCategoryLabel(selectedCategory)}`
              : "Showing: All resources"}
          </p>
          <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`h-9 w-9 rounded-full transition-colors ${
              viewMode === "grid"
                ? "bg-[var(--dash-accent)] text-white shadow-[0_10px_20px_rgba(15,118,110,0.25)]"
                : "bg-[var(--dash-surface-2)] text-[var(--dash-muted)] hover:bg-[rgba(15,118,110,0.12)]"
              }`}
              aria-label="Grid view"
          >
            <Grid className="w-4 h-4 mx-auto" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`h-9 w-9 rounded-full transition-colors ${
              viewMode === "list"
                ? "bg-[var(--dash-accent)] text-white shadow-[0_10px_20px_rgba(15,118,110,0.25)]"
                : "bg-[var(--dash-surface-2)] text-[var(--dash-muted)] hover:bg-[rgba(15,118,110,0.12)]"
              }`}
              aria-label="List view"
          >
            <List className="w-4 h-4 mx-auto" />
          </button>
          </div>
        </div>

        {/* Resources Grid/List */}
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-[var(--dash-surface-2)] rounded-xl"></div>
            ))}
          </div>
        ) : resources.length === 0 ? (
          <div className="bg-[var(--dash-surface)] rounded-2xl p-12 border border-[var(--dash-border)] text-center">
            <AlertCircle className="w-12 h-12 text-[var(--dash-muted)] mx-auto mb-3" />
            <p className="text-[var(--dash-muted)]">No resources found</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((resource) => (
              <div
                key={resource._id}
                className="bg-[var(--dash-surface)] rounded-2xl p-5 border border-[var(--dash-border)] shadow-[0_16px_28px_rgba(31,41,51,0.08)] hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-end justify-between mb-2">
                  <span className="text-2xl">{getTypeIcon(resource.type)}</span>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full border ${getCategoryStyle(resource.category)}`}
                  >
                    {getCategoryLabel(resource.category)}
                  </span>
                </div>
                <h3 className="font-bold text-[var(--dash-ink)] text-base mb-1 line-clamp-2">
                  {resource.title}
                </h3>
                <p className="text-xs text-[var(--dash-muted)] mb-3 line-clamp-2 min-h-[2rem]">
                  {resource.description || "No description added yet."}
                </p>
                <div className="flex items-center gap-3 text-xs text-[var(--dash-muted)] mb-3">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {resource.views || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Download className="w-3 h-3" /> {resource.downloads || 0}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => openDetailsModal(resource)}
                  className="w-full mb-2 inline-flex items-center justify-center rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3 py-2 text-xs font-semibold text-[var(--dash-ink)] hover:bg-[var(--dash-surface-2)]"
                >
                  <Eye className="w-3.5 h-3.5 mr-1" /> Read Details
                </button>
                {resource.filePath && (
                  <button
                    onClick={() => handleDownload(resource)}
                    className="w-full bg-[var(--dash-accent)] hover:bg-[var(--dash-accent-strong)] text-white text-xs font-semibold py-2 rounded-lg transition-colors"
                  >
                    Download
                  </button>
                )}
                {canManageResource(resource) ? (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(resource)}
                      className="inline-flex items-center justify-center rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] px-2 py-2 text-xs font-semibold text-[var(--dash-ink)] hover:bg-[var(--dash-surface-2)]"
                    >
                      <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteResource(resource)}
                      disabled={
                        deletingId === String(resource._id || resource.id)
                      }
                      className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-2 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[var(--dash-surface)] rounded-2xl border border-[var(--dash-border)] overflow-hidden shadow-[0_16px_28px_rgba(31,41,51,0.08)]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--dash-border)] bg-[var(--dash-surface-2)]">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--dash-ink)]">
                    Name
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--dash-ink)]">
                    Type
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--dash-ink)]">
                    Size
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--dash-ink)]">
                    Modified
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[var(--dash-ink)]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {resources.map((resource, idx) => (
                  <tr
                    key={resource._id}
                    className={`border-b border-[var(--dash-border)] transition-colors ${idx % 2 === 0 ? "bg-[var(--dash-surface)]" : "bg-[var(--dash-surface-2)]"} hover:bg-[rgba(15,118,110,0.06)]`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[var(--dash-ink)] truncate">
                          {resource.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--dash-muted)]">
                      {resource.type}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--dash-muted)]">
                      {formatFileSize(resource.fileSize || 0)}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--dash-muted)]">
                      {formatDate(resource.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openDetailsModal(resource)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-ink)] hover:bg-[var(--dash-surface-2)]"
                          title="Read details"
                          aria-label="Read details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {resource.filePath ? (
                          <button
                            type="button"
                            onClick={() => handleDownload(resource)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(15,118,110,0.25)] bg-[var(--dash-accent-soft)] text-[var(--dash-accent)] hover:bg-[rgba(15,118,110,0.2)]"
                            title="Download"
                            aria-label="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        ) : null}
                        {canManageResource(resource) ? (
                          <>
                            <button
                              type="button"
                              onClick={() => openEditModal(resource)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-ink)] hover:bg-[var(--dash-surface-2)]"
                              title="Edit"
                              aria-label="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteResource(resource)}
                              disabled={
                                deletingId ===
                                String(resource._id || resource.id)
                              }
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-60"
                              title="Delete"
                              aria-label="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-100 shadow-xl p-6 relative">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-gray-900 mb-5">
              Upload Resource
            </h3>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  value={uploadForm.title}
                  onChange={(e) => {
                    setUploadForm({ ...uploadForm, title: e.target.value });
                    if (uploadErrors.title) setUploadErrors((prev) => ({ ...prev, title: "" }));
                  }}
                  placeholder="Resource title"
                  className={`w-full h-11 rounded-lg border px-3 text-sm focus:outline-none focus:ring-2 ${
                    uploadErrors.title
                      ? "border-red-400 focus:ring-red-100"
                      : "border-gray-200 focus:ring-blue-100"
                  }`}
                />
                {uploadErrors.title && (
                  <p className="mt-1 text-xs text-red-500">{uploadErrors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) =>
                    setUploadForm({
                      ...uploadForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Brief description"
                  maxLength="300"
                  rows="3"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) =>
                      setUploadForm({ ...uploadForm, category: e.target.value })
                    }
                    className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="other">Other</option>
                    <option value="lecture-notes">Lecture Notes</option>
                    <option value="past-papers">Past Papers</option>
                    <option value="summaries">Summaries</option>
                    <option value="handout">Handout</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={uploadForm.type}
                    onChange={(e) =>
                      setUploadForm({ ...uploadForm, type: e.target.value })
                    }
                    className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="pdf">PDF</option>
                    <option value="document">Document</option>
                    <option value="presentation">Presentation</option>
                    <option value="video">Video</option>
                    <option value="link">Link</option>
                  </select>
                </div>
              </div>

              {uploadForm.type === "link" ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    External Link *
                  </label>
                  <input
                    value={uploadForm.externalLink}
                    onChange={(e) => {
                      setUploadForm({
                        ...uploadForm,
                        externalLink: e.target.value,
                      });
                      if (uploadErrors.externalLink) setUploadErrors((prev) => ({ ...prev, externalLink: "" }));
                    }}
                    placeholder="https://..."
                    className={`w-full h-11 rounded-lg border px-3 text-sm focus:outline-none focus:ring-2 ${
                      uploadErrors.externalLink
                        ? "border-red-400 focus:ring-red-100"
                        : "border-gray-200 focus:ring-blue-100"
                    }`}
                  />
                  {uploadErrors.externalLink && (
                    <p className="mt-1 text-xs text-red-500">{uploadErrors.externalLink}</p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    File *
                  </label>
                  <input
                    type="file"
                    accept={getAcceptAttr(uploadForm.type)}
                    onChange={(e) => {
                      setSelectedFile(e.target.files?.[0] || null);
                      if (uploadErrors.file) setUploadErrors((prev) => ({ ...prev, file: "" }));
                    }}
                    className={`w-full text-sm rounded ${
                      uploadErrors.file ? "outline outline-1 outline-red-400" : ""
                    }`}
                  />
                  {uploadErrors.file && (
                    <p className="mt-1 text-xs text-red-500">{uploadErrors.file}</p>
                  )}
                  {selectedFile && !uploadErrors.file && (
                    <p className="text-xs text-gray-500 mt-1">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="h-10 px-4 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="h-10 px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold disabled:opacity-50"
                >
                  {isUploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Read Details Modal */}
      {showDetailsModal && detailResource ? (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl border border-gray-100 shadow-xl p-6 relative">
            <button
              onClick={() => {
                setShowDetailsModal(false);
                setDetailResource(null);
              }}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Resource Details
            </h3>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Title</p>
                <p className="font-semibold text-gray-900">
                  {detailResource.title || "-"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Description</p>
                <p className="text-gray-800">
                  {detailResource.description || "No description added yet."}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-500">Category</p>
                  <p className="font-semibold text-gray-900">
                    {getCategoryLabel(detailResource.category)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Type</p>
                  <p className="font-semibold text-gray-900">
                    {detailResource.type || "-"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-500">File Size</p>
                  <p className="font-semibold text-gray-900">
                    {formatFileSize(detailResource.fileSize || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Modified</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(detailResource.createdAt)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-500">Views</p>
                  <p className="font-semibold text-gray-900">
                    {detailResource.views || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Downloads</p>
                  <p className="font-semibold text-gray-900">
                    {detailResource.downloads || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowDetailsModal(false);
                  setDetailResource(null);
                }}
                className="h-10 px-4 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Edit Modal */}
      {showEditModal && editingResource ? (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-100 shadow-xl p-6 relative">
            <button
              onClick={closeEditModal}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-gray-900 mb-5">
              Edit Resource
            </h3>

            <form onSubmit={handleUpdateResource} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  value={editForm.title}
                  onChange={(e) => {
                    setEditForm((prev) => ({ ...prev, title: e.target.value }));
                    if (editErrors.title) setEditErrors((prev) => ({ ...prev, title: "" }));
                  }}
                  placeholder="Resource title"
                  className={`w-full h-11 rounded-lg border px-3 text-sm focus:outline-none focus:ring-2 ${
                    editErrors.title
                      ? "border-red-400 focus:ring-red-100"
                      : "border-gray-200 focus:ring-blue-100"
                  }`}
                />
                {editErrors.title && (
                  <p className="mt-1 text-xs text-red-500">{editErrors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Brief description"
                  maxLength="300"
                  rows="3"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="other">Other</option>
                    <option value="lecture-notes">Lecture Notes</option>
                    <option value="past-papers">Past Papers</option>
                    <option value="summaries">Summaries</option>
                    <option value="handout">Handout</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={editForm.type}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, type: e.target.value }))
                    }
                    className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="pdf">PDF</option>
                    <option value="document">Document</option>
                    <option value="presentation">Presentation</option>
                    <option value="video">Video</option>
                    <option value="link">Link</option>
                  </select>
                </div>
              </div>

              {editForm.type === "link" ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    External Link *
                  </label>
                  <input
                    value={editForm.externalLink}
                    onChange={(e) => {
                      setEditForm((prev) => ({
                        ...prev,
                        externalLink: e.target.value,
                      }));
                      if (editErrors.externalLink) setEditErrors((prev) => ({ ...prev, externalLink: "" }));
                    }}
                    placeholder="https://..."
                    className={`w-full h-11 rounded-lg border px-3 text-sm focus:outline-none focus:ring-2 ${
                      editErrors.externalLink
                        ? "border-red-400 focus:ring-red-100"
                        : "border-gray-200 focus:ring-blue-100"
                    }`}
                  />
                  {editErrors.externalLink && (
                    <p className="mt-1 text-xs text-red-500">{editErrors.externalLink}</p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Replace File (optional)
                  </label>
                  <input
                    type="file"
                    accept={getAcceptAttr(editForm.type)}
                    onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                    className="w-full text-sm"
                  />
                  {editFile ? (
                    <p className="text-xs text-gray-500 mt-1">
                      Selected: {editFile.name}
                    </p>
                  ) : null}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="h-10 px-4 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditing}
                  className="h-10 px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold disabled:opacity-50"
                >
                  {isEditing ? "Saving..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
