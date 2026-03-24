import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import http from 'http'
import fs from 'fs'
import path from 'path'
import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import studyCircleRoutes from './routes/studyCircleRoutes.js'
import resourceRoutes from './routes/resourceRoutes.js'
import User from './models/User.js'
import StudyCircle from './models/StudyCircle.js'
import CircleMessage from './models/CircleMessage.js'
import Resource from './models/Resource.js'

import { formatAvatarUrl, normalizeAvatar } from './utils/avatarHelper.js'

dotenv.config()

const app = express()
const httpServer = http.createServer(app)

// ── Middleware ──
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

// ── DB Connect ──


// ── Routes ──
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/circles', studyCircleRoutes)
app.use('/api/resources', resourceRoutes)

// Serve uploads folder
import { fileURLToPath } from 'url'; const __dirname = path.dirname(fileURLToPath(import.meta.url)); app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ── Health Check ──
app.get('/', (req, res) => res.send('Smart Study Circle API Running ✦'))

const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  },
})

app.set('io', io)

const circlePresence = new Map()
const socketCircleMap = new Map()

const emitPresence = (circleId) => {
  const users = Array.from(circlePresence.get(circleId) || [])
  io.to(`circle:${circleId}`).emit('circle:presence', {
    circleId,
    onlineUserIds: users,
  })
}

const addOnlineUser = (circleId, userId) => {
  if (!circlePresence.has(circleId)) {
    circlePresence.set(circleId, new Set())
  }
  circlePresence.get(circleId).add(String(userId))
  emitPresence(circleId)
}

const removeOnlineUser = (circleId, userId) => {
  if (!circlePresence.has(circleId)) return
  const set = circlePresence.get(circleId)
  set.delete(String(userId))
  if (set.size === 0) {
    circlePresence.delete(circleId)
  }
  emitPresence(circleId)
}

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token
    if (!token) return next(new Error('Unauthorized'))

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('_id fullName displayName email avatar profilePicture isVerified')

    if (!user || !user.isVerified) {
      return next(new Error('Unauthorized'))
    }

    socket.user = user
    return next()
  } catch (err) {
    return next(new Error('Unauthorized'))
  }
})

io.on('connection', (socket) => {
  socket.on('circle:join', async ({ circleId }, ack) => {
    try {
      const circle = await StudyCircle.findById(circleId).select('members isActive')
      if (!circle || !circle.isActive) {
        ack?.({ ok: false, message: 'Circle not found.' })
        return
      }

      const isMember = circle.members.some((m) => String(m) === String(socket.user._id))
      if (!isMember) {
        ack?.({ ok: false, message: 'Not a circle member.' })
        return
      }

      socket.join(`circle:${circleId}`)
      socketCircleMap.set(socket.id, String(circleId))
      addOnlineUser(String(circleId), socket.user._id)
      ack?.({ ok: true })
    } catch (err) {
      ack?.({ ok: false, message: 'Could not join chat room.' })
    }
  })

  socket.on('circle:leave', ({ circleId }) => {
    socket.leave(`circle:${circleId}`)
    socketCircleMap.delete(socket.id)
    removeOnlineUser(String(circleId), socket.user._id)
  })

  socket.on('circle:typing', ({ circleId, isTyping }) => {
    if (!circleId) return
    socket.to(`circle:${circleId}`).emit('circle:typing', {
      circleId,
      userId: String(socket.user._id),
      fullName: socket.user.fullName,
      displayName: socket.user.displayName || '',
      isTyping: Boolean(isTyping),
    })
  })

  socket.on('circle:read', async ({ circleId }, ack) => {
    try {
      if (!circleId) {
        ack?.({ ok: false, message: 'circleId is required.' })
        return
      }

      await CircleMessage.updateMany(
        {
          circle: circleId,
          sender: { $ne: socket.user._id },
          status: { $ne: 'read' },
        },
        { $set: { status: 'read' } }
      )

      io.to(`circle:${circleId}`).emit('circle:read', {
        circleId,
        readerId: String(socket.user._id),
        readAt: new Date().toISOString(),
      })

      ack?.({ ok: true })
    } catch (err) {
      ack?.({ ok: false, message: 'Could not update read state.' })
    }
  })

  socket.on('circle:message', async ({ circleId, text }, ack) => {
    try {
      const messageText = text ? String(text).trim() : ''
      if (!messageText) {
        ack?.({ ok: false, message: 'Message is empty.' })
        return
      }

      const circle = await StudyCircle.findById(circleId).select('members isActive')
      if (!circle || !circle.isActive) {
        ack?.({ ok: false, message: 'Circle not found.' })
        return
      }

      const isMember = circle.members.some((m) => String(m) === String(socket.user._id))
      if (!isMember) {
        ack?.({ ok: false, message: 'Only members can send messages.' })
        return
      }

      const created = await CircleMessage.create({
        circle: circleId,
        groupId: circleId,
        sender: socket.user._id,
        senderId: socket.user._id,
        receiverId: null,
        text: messageText,
        status: 'sent',
      })

      const payload = {
        id: created._id,
        circleId,
        groupId: circleId,
        receiverId: null,
        senderId: socket.user._id,
        text: created.text,
        status: created.status,
        createdAt: created.createdAt,
        sender: {
          id: socket.user._id,
          fullName: socket.user.fullName,
          displayName: socket.user.displayName || '',
          email: socket.user.email,
          avatar: normalizeAvatar(socket.user.avatar, socket.user.profilePicture),
        },
      }

      io.to(`circle:${circleId}`).emit('circle:new-message', payload)
      ack?.({ ok: true })
    } catch (err) {
      ack?.({ ok: false, message: 'Failed to send message.' })
    }
  })

  socket.on('disconnect', () => {
    const activeCircleId = socketCircleMap.get(socket.id)
    if (activeCircleId) {
      removeOnlineUser(activeCircleId, socket.user._id)
      socketCircleMap.delete(socket.id)
    }
  })
})

const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    await connectDB()

    // Ensure resources collection/indexes exist even before first upload.
    await Resource.createCollection().catch(() => null)
    await Resource.syncIndexes().catch(() => null)

    httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  } catch (err) {
    console.error('Server startup error:', err.message)
    process.exit(1)
  }
}

startServer()