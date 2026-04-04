import jwt from 'jsonwebtoken'
import { User } from '../models/user.model.js'

export const authMiddleware = async (req, res, next) => {
  try {
    // 1️⃣ Get token from header or cookie
    let token
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1]
    } else if (req.cookies?.token) {
      token = req.cookies.token
    }
    console.log('Auth middleware token:', token)
    // 2️⃣ No token
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: 'Not authorized, no token provided' })
    }

    // 3️⃣ Verify token
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res
          .status(401)
          .json({ success: false, message: 'Token expired' })
      } else if (err.name === 'JsonWebTokenError') {
        return res
          .status(401)
          .json({ success: false, message: 'Token invalid' })
      } else {
        return res
          .status(401)
          .json({ success: false, message: 'Token verification failed' })
      }
    }

    // 4️⃣ Fetch user
    const user = await User.findById(decoded.id)
      .select('-password')
      .populate('store')

    if (!user || !user.isActive) {
      return res
        .status(401)
        .json({ success: false, message: 'User not found or inactive' })
    }

    // 5️⃣ Attach user to request
    req.user = user

    next()
  } catch (err) {
    console.error('Auth middleware server error:', err)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}
