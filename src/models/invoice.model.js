import mongoose from 'mongoose'

const invoiceItemSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  itemName: { type: String, required: true },
  unit: { type: String, default: 'piece' },
  quantity: { type: Number, required: true, min: 1 },
  salePrice: { type: Number, required: true },
  taxPercent: { type: Number, default: 0 },
  subtotal: { type: Number, required: true },
})

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, unique: true },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    customerName: { type: String, default: 'Walk-in Customer' },
    customerPhone: { type: String, default: '' },
    items: [invoiceItemSchema],
    subtotal: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'online', 'credit'],
      default: 'cash',
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'partial'],
      default: 'paid',
    },
    notes: { type: String, default: '' },
    saleDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

invoiceSchema.pre('save', async function (next) {
  if (!this.invoiceNumber) {
    const count = await mongoose
      .model('Invoice')
      .countDocuments({ store: this.store })
    const pad = String(count + 1).padStart(5, '0')
    this.invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${pad}`
  }
  next()
})
export const Invoice = mongoose.model('Invoice', invoiceSchema)
