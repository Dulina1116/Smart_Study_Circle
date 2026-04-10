import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const protect = async (req, res, next) => {
  try {
    // Token check
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('[AUTH ERROR] Missing or malformed Authorization header');
      return res.status(401).json({ message: 'Not authorized. No token provided.' })
    }

    const token = authHeader.split(' ')[1]

    // Token verify
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (jwtErr) {
      console.error(`[AUTH ERROR] Token verification failed: ${jwtErr.message}`);
      const msg = jwtErr.name === 'TokenExpiredError' ? 'Token expired. Please login again.' : 'Invalid token.';
      return res.status(401).json({ message: `Not authorized. ${msg}` })
    }

    // User find
    const user = await User.findById(decoded.id).select('-password')
    if (!user) {
      console.error(`[AUTH ERROR] User with ID ${decoded.id} not found in database`);
      return res.status(401).json({ message: 'User no longer exists.' })
    }

    if (!user.isVerified) {
      console.error(`[AUTH ERROR] User ${user.email} is not verified`);
      return res.status(401).json({ message: 'Please verify your email first.' })
    }

    req.user = user
    next()
  } catch (err) {
    console.error('[AUTH ERROR] Unexpected error in protect middleware:', err.message)
    return res.status(500).json({ message: 'Internal server error during authentication.' })
  }
}

// Role-based access control
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      console.error(`[AUTH ERROR] User ${req.user.email} attempted to access ${req.originalUrl} without sufficient role. Required: [${roles.join(', ')}], Found: [${req.user.role}]`);
      return res.status(403).json({
        message: `Access denied. You do not have permission to access this resource.`,
      })
    }
    next()
  }
}

export { protect, authorizeRoles }