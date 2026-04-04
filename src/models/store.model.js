import mongoose from 'mongoose'

const storeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    storeType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StoreType',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    logo: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export const Store = mongoose.model('Store', storeSchema)
