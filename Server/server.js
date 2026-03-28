import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import fs from "fs";
import path from "path";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import studyCircleRoutes from "./routes/studyCircleRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import officeHourRoutes from "./routes/officeHourRoutes.js";
import circleRoutes from "./routes/circleRoutes.js";
import lecturerResourceRoute from "./routes/lecturerResourceRoute.js";
import notificationRoutes from "./routes/notificationRoutes.js";

// Models
import User from "./models/User.js";
import StudyCircle from "./models/StudyCircle.js";
import CircleMessage from "./models/CircleMessage.js";
import Resource from "./models/Resource.js";
import Notification from "./models/Notification.js";

// Utils
import { normalizeAvatar } from "./utils/avatarHelper.js";

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

// ── Middleware ──
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ── Routes ──
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/circles", studyCircleRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/office-hours", officeHourRoutes);
app.use("/api/lecturer-circles", circleRoutes);
app.use("/api/lecturer-resources", lecturerResourceRoute);
app.use("/api/notifications", notificationRoutes);

// Serve uploads folder from workspace root (matches multer destinations)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ── Health Check ──
app.get("/", (req, res) => res.send("Smart Study Circle API Running ✦"));

const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  },
});

app.set("io", io);

// Presence Maps
const circlePresence = new Map();
const socketCircleMap = new Map();

const emitPresence = (circleId) => {
  const users = Array.from(circlePresence.get(circleId) || []);
  io.to(`circle:${circleId}`).emit("circle:presence", {
    circleId,
    onlineUserIds: users,
  });
};

const addOnlineUser = (circleId, userId) => {
  if (!circlePresence.has(circleId)) {
    circlePresence.set(circleId, new Set());
  }
  circlePresence.get(circleId).add(String(userId));
  emitPresence(circleId);
};

const removeOnlineUser = (circleId, userId) => {
  if (!circlePresence.has(circleId)) return;

  const set = circlePresence.get(circleId);
  set.delete(String(userId));

  if (set.size === 0) {
    circlePresence.delete(circleId);
  }

  emitPresence(circleId);
};

// Socket Auth
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Unauthorized"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select(
      "_id fullName displayName email avatar profilePicture isVerified",
    );

    if (!user || !user.isVerified) {
      return next(new Error("Unauthorized"));
    }

    socket.user = user;
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
});

// Socket Connection
io.on("connection", (socket) => {
  socket.on("circle:join", async ({ circleId }, ack) => {
    try {
      const circle =
        await StudyCircle.findById(circleId).select("members isActive");

      if (!circle || !circle.isActive) {
        ack?.({ ok: false, message: "Circle not found." });
        return;
      }

      const isMember = circle.members.some(
        (m) => String(m) === String(socket.user._id),
      );

      if (!isMember) {
        ack?.({ ok: false, message: "Not a circle member." });
        return;
      }

      socket.join(`circle:${circleId}`);
      socketCircleMap.set(socket.id, String(circleId));
      addOnlineUser(String(circleId), socket.user._id);

      ack?.({ ok: true });
    } catch {
      ack?.({ ok: false });
    }
  });

  socket.on("circle:leave", ({ circleId }) => {
    socket.leave(`circle:${circleId}`);
    socketCircleMap.delete(socket.id);
    removeOnlineUser(String(circleId), socket.user._id);
  });

  socket.on("circle:typing", ({ circleId, isTyping }) => {
    socket.to(`circle:${circleId}`).emit("circle:typing", {
      circleId,
      userId: String(socket.user._id),
      fullName: socket.user.fullName,
      displayName: socket.user.displayName || "",
      isTyping: Boolean(isTyping),
    });
  });

  socket.on("circle:message", async ({ circleId, text }, ack) => {
    try {
      if (!text?.trim()) {
        ack?.({ ok: false });
        return;
      }

      const created = await CircleMessage.create({
        circle: circleId,
        sender: socket.user._id,
        text: text.trim(),
        status: "sent",
      });

      const payload = {
        id: created._id,
        circleId,
        text: created.text,
        status: created.status,
        createdAt: created.createdAt,
        sender: {
          id: socket.user._id,
          fullName: socket.user.fullName,
          displayName: socket.user.displayName || "",
          email: socket.user.email,
          avatar: normalizeAvatar(
            socket.user.avatar,
            socket.user.profilePicture,
          ),
        },
      };

      io.to(`circle:${circleId}`).emit("circle:new-message", payload);

      ack?.({ ok: true });
    } catch {
      ack?.({ ok: false });
    }
  });

  socket.on("disconnect", () => {
    const circleId = socketCircleMap.get(socket.id);
    if (circleId) {
      removeOnlineUser(circleId, socket.user._id);
      socketCircleMap.delete(socket.id);
    }
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    await Resource.createCollection().catch(() => null);
    await Resource.syncIndexes().catch(() => null);

    httpServer.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`),
    );
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

startServer();
