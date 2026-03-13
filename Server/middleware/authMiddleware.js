import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const protect = async (req, res, next) => {
  try {
    // Token check
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized. No token provided.' })
    }

    const token = authHeader.split(' ')[1]

    // Token verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // User find
    const user = await User.findById(decoded.id).select('-password')
    if (!user) {
      return res.status(401).json({ message: 'User not found.' })
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: 'Please verify your email first.' })
    }

    req.user = user
    next()
  } catch (err) {
    console.error('Auth Middleware Error:', err.message)
    return res.status(401).json({ message: 'Not authorized. Invalid token.' })
  }
}

// Role-based access control
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Only ${roles.join(', ')} can access this.`,
      })
    }
    next()
  }
}

export { protect, authorizeRoles }