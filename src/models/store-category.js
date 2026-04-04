import mongoose from 'mongoose'

const storeCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true, // Grocery, Plumber etc
    },

    description: {
      type: String,
      default: '',
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    icon: {
      url: {
        type: String,
        default: '',
      },
      name: {
        type: String,
        default: '',
      },
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
)

export const StoreCategory = mongoose.model(
  'StoreCategory',
  storeCategorySchema
)
