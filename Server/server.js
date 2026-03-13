import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'

dotenv.config()

const app = express()

// ── Middleware ──
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}))
app.use(express.json())

// ── DB Connect ──
connectDB()

// ── Routes ──
app.use('/api/auth', authRoutes)

// ── Health Check ──
app.get('/', (req, res) => res.send('Smart Study Circle API Running ✦'))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))