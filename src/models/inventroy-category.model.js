import mongoose from 'mongoose'

const inventoryCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    storeCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StoreCategory',
      required: true,
    },

    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
    createdByRole: {
      type: String,
      enum: ['super-admin', 'store-owner'],
      required: true,
    },

    isGlobal: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

export const InventoryCategory = mongoose.model(
  'InventoryCategory',
  inventoryCategorySchema
)
