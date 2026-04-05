import jwt from 'jsonwebtoken'
import { User } from '../models/user.model.js'
import { StoreType } from '../models/store-type.model.js'
import { supabase } from '../db/client.js'
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

    const fieldErrors = {}

    // 1️⃣ Validate required fields

    // 2️⃣ Check if user exists
    const { data: existingUser } = await supabase()
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
        
        errors: { email: 'Email is already in use' },
      })
    }

    // 3️⃣ Insert new user
    const { data: newUser, error: insertError } = await supabase()
      .from('users')
      .insert([
        {
          name,
          email,
          password, // TODO: hash password
          role,
          is_active: true,
          created_at: new Date(),
        },
      ])
      .select()
      .single()

    if (insertError) throw insertError

    let storeId = null

    // 4️⃣ Insert store if store-owner
    if (role === 'store-owner') {
      const { data: newStore, error: storeError } = await supabase()
        .from('stores')
        .insert([
          {
            name: storeName,
            store_category_id: storeTypeId,
            owner_id: newUser.id,
            address: storeAddress,
            phone: storePhone,
            email,
            created_at: new Date(),
          },
        ])
        .select()
        .single()

      if (storeError) throw storeError
      storeId = newStore.id
    }

    // 5️⃣ Generate token
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    })

    return res.status(201).json({
      success: true,
      token,
      user: { ...newUser, store: storeId || null },
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({
      success: false,
      message: 'Server error',
      errors: { server: err.message },
    })
  }
}

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: 'Email and password required' })

    const { data: user, error } = await supabase()
      .from('users')
      .select('*, stores(*)') // join store table
      .eq('email', email)
      .single()

    if (!user || user.password !== password)
      return res
        .status(401)
        .json({ success: false, message: 'Invalid credentials' })

    if (!user.is_active)
      return res
        .status(403)
        .json({ success: false, message: 'Account deactivated' })

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    })

    return res.status(200).json({ success: true, token, user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = req.user

    res.json({ success: true, user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: err.message })
  }
}
export default { getMe, login, signup }
