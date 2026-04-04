import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ['super-admin', 'store-owner', 'user'],
      default: 'user',
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StoreCategory',
      default: null,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 10)
})

// Compare password
userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password)
}

export const User = mongoose.model('User', userSchema)
