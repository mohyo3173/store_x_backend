import mongoose from 'mongoose'

const itemSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    sku: { type: String, default: '' },
    category: { type: String, default: '' },
    unit: {
      type: String,
      enum: [
        'piece',
        'kg',
        'gram',
        'litre',
        'ml',
        'meter',
        'box',
        'dozen',
        'pack',
        'service',
      ],
      default: 'piece',
    },
    quantity: { type: Number, required: true, default: 0, min: 0 },
    costPrice: { type: Number, default: 0, min: 0 },
    salePrice: { type: Number, required: true, min: 0 },
    taxPercent: { type: Number, default: 0, min: 0 },
    image: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

itemSchema.virtual('stockValue').get(function () {
  return this.quantity * this.salePrice
})

export const Item = mongoose.model('Item', itemSchema)
