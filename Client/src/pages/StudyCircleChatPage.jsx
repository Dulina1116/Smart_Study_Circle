import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Download,
  FileText,
  MoreVertical,
  Paperclip,
  Phone,
  Search,
  Send,
  Smile,
  Video,
  Users,
} from "lucide-react";
import { io } from "socket.io-client";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN ||
  `${window.location.protocol}//${window.location.hostname}:5000`;
const API_BASE = `${API_ORIGIN}/api/circles`;
const SOCKET_BASE = API_ORIGIN;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const requestWithTimeout = async (
  url,
  options = {},
  timeoutMs = 20000,
  retries = 1,
) => {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);
      return res;
    } catch (err) {
      clearTimeout(timer);
      const canRetry =
        err?.name === "AbortError" ||
        String(err?.message || "").includes("Failed to fetch");
      if (!canRetry || attempt === retries) {
        throw err;
      }
      await wait(400 * (attempt + 1));
    }
  }
};

const createHeaders = () => {
  const token = (localStorage.getItem("token") || "").replace(/[\r\n"]/g, "");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const parseResponse = async (res) => {
  const text = await res.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: "Unexpected server response." };
  }

  if (res.status === 401) {
    console.error("Unauthorized access - clearing auth.");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    return data;
  }

  if (!res.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
};

const isValidAvatarUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  // Accept http/https URLs, file uploads, relative paths, and base64 data URIs
  return (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("/uploads/") ||
    url.startsWith("data:") ||
    url.startsWith("/")
  );
};

const getAvatarUrl = (url) => {
  if (!url) return "";
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:")
  )
    return url;
  // Handle relative paths from backend
  let relativePath = url.startsWith("/") ? url : `/${url}`;
  if (url.startsWith("profile-") || url.startsWith("chat/"))
    relativePath = `/uploads/${url}`;
  if (url.startsWith("uploads/")) relativePath = `/${url}`;
  return `${API_ORIGIN}${relativePath}`;
};

const formatTime = (iso) => {
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

const isImageFile = (mimeType) => mimeType?.startsWith("image/");

const formatFileSize = (bytes) => {
  const value = Number(bytes || 0);
  if (!value) return "0 KB";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
};

const fileTypeLabel = (mimeType, fileName) => {
  const type = String(mimeType || "").toLowerCase();
  const name = String(fileName || "").toLowerCase();
  if (type.includes("pdf") || name.endsWith(".pdf")) return "PDF";
  if (type.includes("word") || name.endsWith(".doc") || name.endsWith(".docx"))
    return "DOCX";
  if (type.includes("sheet") || name.endsWith(".xls") || name.endsWith(".xlsx"))
    return "XLSX";
  return "FILE";
};

export default function StudyCircleChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { circleId } = useParams();

  const fallbackCircle = location.state?.circle || null;

  const [circle, setCircle] = useState(fallbackCircle);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [failedAvatars, setFailedAvatars] = useState(new Set());
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Map());

  const socketRef = useRef(null);
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const currentUser = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const myId = String(currentUser?.id || currentUser?._id || "");
  const members = circle?.members || [];
  const onlineMembers = members.filter((m) => onlineUserIds.has(String(m.id)));
  const offlineMembers = members.filter(
    (m) => !onlineUserIds.has(String(m.id)),
  );
  const onlineCount = onlineMembers.length;

  const memberRoleMap = useMemo(() => {
    const map = new Map();
    if (!circle) return map;

    // Creator
    if (circle.creator?.id) map.set(String(circle.creator.id), "Moderator");
    else if (circle.creator)
      map.set(String(circle.creator), "Moderator");

      // Co-mods
    (circle.coModerators || []).forEach((m) => {
      map.set(String(m.id || m), "Co-Moderator");
    });

    return map;
  }, [circle]);

  const getMemberRole = (memberId) => {
    return memberRoleMap.get(String(memberId)) || "Member";
  };

  const handleAvatarError = (memberId) => {
    setFailedAvatars((prev) => new Set([...prev, String(memberId)]));
  };

  const appendMessage = (message) => {
    setMessages((prev) => {
      if (prev.some((m) => String(m.id) === String(message.id))) {
        return prev;
      }
      return [...prev, message];
    });
  };

  const scrollToBottom = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError("");
      try {
        const [circleRes, messageRes] = await Promise.all([
          requestWithTimeout(`${API_BASE}/${circleId}`, {
            headers: createHeaders(),
          }),
          requestWithTimeout(`${API_BASE}/${circleId}/messages`, {
            headers: createHeaders(),
          }),
        ]);

        const circleData = await parseResponse(circleRes);
        const messageData = await parseResponse(messageRes);

        setCircle(circleData.circle);
        setMessages(messageData.messages || []);
      } catch (err) {
        if (err.name === "AbortError") {
          setError("Chat server is slow right now. Please try again.");
        } else if (err.message?.includes("Failed to fetch")) {
          setError(
            "Could not connect to chat server. Ensure backend is running.",
          );
        } else {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [circleId]);

  useEffect(() => {
    const token = (localStorage.getItem("token") || "").replace(/[\r\n"]/g, "");
    if (!token) return undefined;

    const socket = io(SOCKET_BASE, {
      // Use default transport strategy (polling -> websocket upgrade) for reliability in dev/hot-reload.
      transports: ["polling", "websocket"],
      auth: { token },
      reconnection: true,
      timeout: 10000,
    });

    socketRef.current = socket;

    const onConnect = () => {
      socket.emit("circle:join", { circleId });
    };

    const onNewMessage = (message) => {
      if (String(message.circleId) !== String(circleId)) return;
      appendMessage(message);
      socket.emit("circle:read", { circleId });
    };

    const onPresence = ({ circleId: incomingCircleId, onlineUserIds: ids }) => {
      if (String(incomingCircleId) !== String(circleId)) return;
      setOnlineUserIds(new Set((ids || []).map((id) => String(id))));
    };

    const onTyping = ({
      circleId: incomingCircleId,
      userId,
      displayName,
      fullName,
      isTyping,
    }) => {
      if (String(incomingCircleId) !== String(circleId)) return;
      if (String(userId) === myId) return;

      setTypingUsers((prev) => {
        const next = new Map(prev);
        if (isTyping) {
          next.set(String(userId), displayName || fullName || "User");
        } else {
          next.delete(String(userId));
        }
        return next;
      });
    };

    const onRead = ({ circleId: incomingCircleId, readerId }) => {
      if (String(incomingCircleId) !== String(circleId)) return;
      if (String(readerId) === myId) return;

      setMessages((prev) =>
        prev.map((m) =>
          String(m.sender?.id || m.senderId) === myId
            ? { ...m, status: "read" }
            : m,
        ),
      );
    };

    const onConnectError = () => {
      // Avoid noisy uncaught transport errors in development strict mode remounts.
    };

    socket.on("connect", onConnect);
    socket.on("circle:new-message", onNewMessage);
    socket.on("circle:presence", onPresence);
    socket.on("circle:typing", onTyping);
    socket.on("circle:read", onRead);
    socket.on("connect_error", onConnectError);

    return () => {
      if (socket.connected) {
        socket.emit("circle:leave", { circleId });
      }
      socket.off("connect", onConnect);
      socket.off("circle:new-message", onNewMessage);
      socket.off("circle:presence", onPresence);
      socket.off("circle:typing", onTyping);
      socket.off("circle:read", onRead);
      socket.off("connect_error", onConnectError);
      socket.disconnect();
    };
  }, [circleId, myId]);

  useEffect(() => {
    if (!socketRef.current || isLoading) return;
    socketRef.current.emit("circle:read", { circleId });
  }, [isLoading, circleId, messages.length]);

  const sendMessage = () => {
    const text = draft.trim();
    if (!text || isSending) return;

    setIsSending(true);
    socketRef.current?.emit("circle:message", { circleId, text }, (ack) => {
      setIsSending(false);
      if (!ack?.ok) {
        alert(ack?.message || "Failed to send message.");
        return;
      }
      setDraft("");
      socketRef.current?.emit("circle:typing", { circleId, isTyping: false });
    });
  };

  const emitTyping = (nextValue) => {
    if (!socketRef.current) return;

    const isTyping = Boolean(String(nextValue || "").trim());
    socketRef.current.emit("circle:typing", { circleId, isTyping });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit("circle:typing", { circleId, isTyping: false });
      }, 1200);
    }
  };

  const uploadFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const token = (localStorage.getItem("token") || "").replace(
        /[\r\n"]/g,
        "",
      );
      const formData = new FormData();
      formData.append("file", file);

      const res = await requestWithTimeout(
        `${API_BASE}/${circleId}/messages/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
        15000,
      );

      await parseResponse(res);
      event.target.value = "";
    } catch (err) {
      alert(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="h-screen bg-[#0f1115] text-slate-100 flex">
      <div className="flex-1 min-w-0 flex">
        <div className="flex-1 min-w-0 flex flex-col">
          <header className="h-16 bg-[#141922] border-b border-[#222a36] px-3 md:px-5 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => navigate("/dashboard/student")}
                className="w-9 h-9 rounded-full hover:bg-[#1e2633] text-slate-300 inline-flex items-center justify-center"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="w-10 h-10 rounded-full bg-[#16a34a] text-white font-bold flex items-center justify-center shadow-sm">
                {(circle?.subject || "S").charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0">
                <h1 className="text-base md:text-lg font-bold text-slate-100 truncate">
                  {circle?.subject || "Study Circle Chat"}
                </h1>
                <p className="text-xs text-slate-400 truncate">
                  {circle?.moduleCode
                    ? `${circle.moduleCode} • ${circle.semester} • Year ${circle.year} • ${onlineCount} online`
                    : "Realtime group chat"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                className="w-9 h-9 rounded-full hover:bg-[#1e2633] text-slate-300 inline-flex items-center justify-center"
                aria-label="Call"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                className="w-9 h-9 rounded-full hover:bg-[#1e2633] text-slate-300 inline-flex items-center justify-center"
                aria-label="Video call"
              >
                <Video className="w-4 h-4" />
              </button>
              <button
                className="w-9 h-9 rounded-full hover:bg-[#1e2633] text-slate-300 inline-flex items-center justify-center"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                className="w-9 h-9 rounded-full hover:bg-[#1e2633] text-slate-300 inline-flex items-center justify-center"
                aria-label="Menu"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </header>

          {error ? (
            <div className="mx-4 mt-3 rounded-lg bg-red-900/40 border border-red-500/30 p-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <main
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-3 md:px-6 py-4"
            style={{
              backgroundColor: "#0f1115",
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          >
            {isLoading ? (
              <div className="text-sm text-slate-400">Loading chat...</div>
            ) : messages.length === 0 ? (
              <div className="max-w-md mx-auto mt-8 rounded-xl bg-[#1a202b] border border-[#2a3140] px-4 py-3 text-sm text-slate-400 text-center">
                No messages yet. Start chatting.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-center">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#26313d] text-slate-300">
                    Today
                  </span>
                </div>

                {messages.map((message) => {
                  const mine = String(message.sender?.id) === myId;
                  const hasFile =
                    message.messageType === "file" && message.fileUrl;
                  const senderName =
                    message.sender?.displayName ||
                    message.sender?.fullName ||
                    "Student";

                  return (
                    <div
                      key={message.id}
                      className={`flex ${mine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[90%] md:max-w-[70%] ${mine ? "items-end" : "items-start"} flex flex-col`}
                      >
                        {!mine ? (
                          <p className="text-xs font-semibold text-emerald-400 ml-1 mb-1">
                            {senderName}
                          </p>
                        ) : null}

                        <div
                          className={`rounded-2xl px-3 py-2 shadow-md ${mine ? "bg-[#1f8f4d] text-white rounded-br-md" : "bg-[#242a35] text-slate-100 rounded-bl-md border border-[#313846]"}`}
                        >
                          {message?.isForwarded ? (
                            <p className="text-[11px] italic mb-1 text-slate-300">
                              Forwarded
                            </p>
                          ) : null}

                          {hasFile ? (
                            <div className="space-y-2">
                              {isImageFile(message.mimeType) ? (
                                <img
                                  src={`${API_ORIGIN}${message.fileUrl}`}
                                  alt={message.fileName || "Uploaded file"}
                                  loading="lazy"
                                  decoding="async"
                                  className="rounded-lg max-h-72 object-cover"
                                />
                              ) : (
                                <div className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-9 h-9 rounded-lg bg-white/15 inline-flex items-center justify-center text-white/90">
                                      <FileText className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-semibold truncate">
                                        {message.fileName || "Attachment"}
                                      </p>
                                      <p className="text-[11px] opacity-80">
                                        {fileTypeLabel(
                                          message.mimeType,
                                          message.fileName,
                                        )}{" "}
                                        • {formatFileSize(message.fileSize)}
                                      </p>
                                    </div>
                                  </div>
                                  <a
                                    href={`${API_ORIGIN}${message.fileUrl}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 inline-flex items-center justify-center"
                                    aria-label="Download file"
                                  >
                                    <Download className="w-4 h-4" />
                                  </a>
                                </div>
                              )}

                              {message.text ? (
                                <p className="text-sm whitespace-pre-wrap break-words">
                                  {message.text}
                                </p>
                              ) : null}
                            </div>
                          ) : (
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {message.text}
                            </p>
                          )}

                          <div
                            className={`mt-1 text-[11px] inline-flex items-center gap-1 w-full justify-end ${mine ? "text-emerald-100" : "text-slate-400"}`}
                          >
                            <span>{formatTime(message.createdAt)}</span>
                            {mine ? (
                              <span
                                className={
                                  message.status === "read"
                                    ? "text-cyan-200"
                                    : "text-slate-300"
                                }
                              >
                                ✓✓
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>

          <footer className="bg-[#141922] border-t border-[#222a36] px-2 md:px-3 py-2.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="w-10 h-10 rounded-full hover:bg-[#1e2633] text-slate-400 inline-flex items-center justify-center"
                aria-label="Emoji"
              >
                <Smile className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-10 h-10 rounded-full hover:bg-[#1e2633] text-slate-400 inline-flex items-center justify-center"
                aria-label="Attachment"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={uploadFile}
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
              />

              <input
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  emitTyping(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={
                  isUploading ? "Uploading file..." : "Type a message"
                }
                className="flex-1 h-11 rounded-full border border-[#2a3140] bg-[#1c232e] text-slate-100 px-4 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
              />

              <button
                type="button"
                onClick={sendMessage}
                disabled={isSending}
                className="w-11 h-11 rounded-full bg-[#1f8f4d] hover:bg-[#1a7a41] text-white inline-flex items-center justify-center shadow-md disabled:opacity-60"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            {typingUsers.size > 0 ? (
              <p className="text-[11px] text-emerald-400 ml-14 mt-1">
                {Array.from(typingUsers.values()).slice(0, 2).join(", ")}{" "}
                {typingUsers.size > 1 ? "are" : "is"} typing...
              </p>
            ) : null}
          </footer>
        </div>

        <aside className="hidden lg:flex lg:w-[350px] border-l border-[#20252e] bg-[#121821] flex-col">
          <div className="h-[92px] px-4 border-b border-[#20252e] flex flex-col justify-center">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-100">
                Group Members
              </h2>
              <span className="w-7 h-7 rounded-full bg-emerald-500 text-white text-xs font-bold inline-flex items-center justify-center">
                {members.length}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              {onlineMembers.length} online • {offlineMembers.length} offline
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <p className="text-sm font-bold text-emerald-400 mb-2">
                ONLINE — {onlineMembers.length}
              </p>
              <div className="space-y-2">
                {onlineMembers.map((member) => {
                  const role = getMemberRole(member.id);
                  const mine = String(member.id) === myId;

                  return (
                    <div
                      key={member.id}
                      className="rounded-xl bg-[#1b2431] border border-[#2a3445] px-3 py-2.5 flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-emerald-500 flex-shrink-0 flex items-center justify-center text-base font-bold text-white">
                        {isValidAvatarUrl(member.avatar) &&
                        !failedAvatars.has(String(member.id)) ? (
                          <img
                            src={getAvatarUrl(member.avatar)}
                            alt={
                              member.displayName || member.fullName || "Member"
                            }
                            className="w-full h-full object-cover"
                            onError={() => handleAvatarError(member.id)}
                          />
                        ) : isValidAvatarUrl(member.profilePicture) &&
                          !failedAvatars.has(String(member.id)) ? (
                          <img
                            src={getAvatarUrl(member.profilePicture)}
                            alt={
                              member.displayName || member.fullName || "Member"
                            }
                            className="w-full h-full object-cover"
                            onError={() => handleAvatarError(member.id)}
                          />
                        ) : (
                          <span>
                            {(member.displayName || member.fullName || "S")
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-100 truncate">
                          {member.displayName ||
                            member.fullName ||
                            member.email}
                          {mine ? " (You)" : ""}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {role}
                        </p>
                      </div>

                      {role === "Moderator" || role === "Co-Moderator" ? (
                        <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-[#1f8f4d] text-white">
                          MOD
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-slate-400 mb-2">
                OFFLINE — {offlineMembers.length}
              </p>
              <div className="space-y-2">
                {offlineMembers.length === 0 ? (
                  <p className="text-xs text-slate-500">No offline members.</p>
                ) : (
                  offlineMembers.map((member) => {
                    const role = getMemberRole(member.id);
                    const mine = String(member.id) === myId;

                    return (
                      <div
                        key={member.id}
                        className="rounded-xl bg-[#161d28] border border-[#242e3d] px-3 py-2.5 flex items-center gap-3"
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-500 flex-shrink-0 flex items-center justify-center text-base font-bold text-white">
                          {isValidAvatarUrl(member.avatar) &&
                          !failedAvatars.has(String(member.id)) ? (
                            <img
                              src={getAvatarUrl(member.avatar)}
                              alt={
                                member.displayName ||
                                member.fullName ||
                                "Member"
                              }
                              className="w-full h-full object-cover"
                              onError={() => handleAvatarError(member.id)}
                            />
                          ) : isValidAvatarUrl(member.profilePicture) &&
                            !failedAvatars.has(String(member.id)) ? (
                            <img
                              src={getAvatarUrl(member.profilePicture)}
                              alt={
                                member.displayName ||
                                member.fullName ||
                                "Member"
                              }
                              className="w-full h-full object-cover"
                              onError={() => handleAvatarError(member.id)}
                            />
                          ) : (
                            <span>
                              {(member.displayName || member.fullName || "S")
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-200 truncate">
                            {member.displayName ||
                              member.fullName ||
                              member.email}
                            {mine ? " (You)" : ""}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {role}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
