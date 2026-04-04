import jwt from 'jsonwebtoken'
import { User } from '../models/user.model.js'
import { StoreType } from '../models/store-type.model.js'

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  })

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id)
  user.password = undefined

  const isProd = process.env.NODE_ENV === 'production'
  const cookieOptions = isProd
    ? {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      }
    : {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      }

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({ success: true, token, user })
}

// POST /api/auth/signup
const signup = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      storeTypeId,
      storeName,
      storeAddress,
      storePhone,
    } = req.body

    if (!['user', 'store-owner'].includes(role)) {
      return res
        .status(400)
        .json({ success: false, message: 'Role must be user or store_owner' })
    }

    const existing = await User.findOne({ email })
    if (existing)
      return res
        .status(400)
        .json({ success: false, message: 'Email already registered' })

    let storeId = null

    if (role === 'store_owner') {
      if (!storeTypeId || !storeName) {
        return res.status(400).json({
          success: false,
          message: 'Store type and store name are required for store owners',
        })
      }
      const storeType = await StoreType.findById(storeTypeId)
      if (!storeType || !storeType.isActive) {
        return res
          .status(400)
          .json({ success: false, message: 'Invalid or inactive store type' })
      }

      // Create user first, then store
      const user = await User.create({ name, email, password, role })
      const store = await Store.create({
        name: storeName,
        storeType: storeTypeId,
        owner: user._id,
        address: storeAddress || '',
        phone: storePhone || '',
        email,
      })
      user.store = store._id
      await user.save()
      return sendToken(user, 201, res)
    }

    const user = await User.create({ name, email, password, role: 'user' })
    return sendToken(user, 201, res)
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: err.message })
  }
}

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: 'Email and password are required' })
console.log('Login attempt:', email,password)
    const user = await User.findOne({ email }).populate('store')
    if (!user || !(await user.matchPassword(password)))
      return res
        .status(401)
        .json({ success: false, message: 'Invalid credentials' })

    if (!user.isActive)
      return res
        .status(403)
        .json({ success: false, message: 'Account deactivated' })

    return sendToken(user, 200, res)
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/auth/me
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-password')
    .populate('store')
  res.json({ success: true, user })
}
export default { getMe, login, signup }
