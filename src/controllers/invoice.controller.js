import { Invoice } from '../models/invoice.model.js'

import mongoose from 'mongoose'
import { Item } from '../models/item.model.js'

const getStoreId = (req) =>
  req.user.role === 'superadmin' ? req.params.storeId : req.user.store?._id

// POST /api/stores/:storeId/invoices  — create invoice & deduct stock
const createInvoice = async (req, res) => {
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const storeId = getStoreId(req)
    const {
      customerName,
      customerPhone,
      items,
      discount = 0,
      paymentMethod,
      paymentStatus,
      notes,
    } = req.body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: 'At least one item is required' })
    }

    const invoiceItems = []
    let subtotal = 0
    let taxAmount = 0

    for (const entry of items) {
      const { itemId, quantity } = entry
      if (!itemId || !quantity || quantity < 1) {
        await session.abortTransaction()
        return res.status(400).json({
          success: false,
          message: 'Each entry needs itemId and quantity >= 1',
        })
      }

      const item = await Item.findOne({
        _id: itemId,
        store: storeId,
        isActive: true,
      }).session(session)
      if (!item) {
        await session.abortTransaction()
        return res.status(404).json({
          success: false,
          message: `Item ${itemId} not found in this store`,
        })
      }
      if (item.quantity < quantity) {
        await session.abortTransaction()
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for '${item.name}'. Available: ${item.quantity}`,
        })
      }

      // Deduct stock
      item.quantity -= quantity
      await item.save({ session })

      const itemSubtotal = quantity * item.salePrice
      const itemTax = (itemSubtotal * item.taxPercent) / 100
      subtotal += itemSubtotal
      taxAmount += itemTax

      invoiceItems.push({
        item: item._id,
        itemName: item.name,
        unit: item.unit,
        quantity,
        salePrice: item.salePrice,
        taxPercent: item.taxPercent,
        subtotal: itemSubtotal,
      })
    }

    const totalAmount = subtotal + taxAmount - Number(discount)

    const [invoice] = await Invoice.create(
      [
        {
          store: storeId,
          createdBy: req.user._id,
          customerName: customerName || 'Walk-in Customer',
          customerPhone,
          items: invoiceItems,
          subtotal,
          taxAmount,
          discount: Number(discount),
          totalAmount,
          paymentMethod,
          paymentStatus,
          notes,
          saleDate: new Date(),
        },
      ],
      { session }
    )

    await session.commitTransaction()
    res.status(201).json({ success: true, data: invoice })
  } catch (err) {
    await session.abortTransaction()
    res.status(500).json({ success: false, message: err.message })
  } finally {
    session.endSession()
  }
}

// GET /api/stores/:storeId/invoices
const getInvoices = async (req, res) => {
  try {
    const storeId = getStoreId(req)
    const {
      startDate,
      endDate,
      paymentStatus,
      page = 1,
      limit = 20,
    } = req.query
    const filter = { store: storeId }
    if (paymentStatus) filter.paymentStatus = paymentStatus
    if (startDate || endDate) {
      filter.saleDate = {}
      if (startDate) filter.saleDate.$gte = new Date(startDate)
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        filter.saleDate.$lte = end
      }
    }

    const total = await Invoice.countDocuments(filter)
    const invoices = await Invoice.find(filter)
      .populate('createdBy', 'name email')
      .sort({ saleDate: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    res.json({ success: true, total, page: Number(page), data: invoices })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/stores/:storeId/invoices/:id
const getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      store: getStoreId(req),
    }).populate('createdBy', 'name email')
    if (!invoice)
      return res
        .status(404)
        .json({ success: false, message: 'Invoice not found' })
    res.json({ success: true, data: invoice })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/stores/:storeId/sales-report  — daily sales grouped by date
const salesReport = async (req, res) => {
  try {
    const storeId = getStoreId(req)
    const { startDate, endDate } = req.query
    const match = { store: new mongoose.Types.ObjectId(storeId) }
    if (startDate || endDate) {
      match.saleDate = {}
      if (startDate) match.saleDate.$gte = new Date(startDate)
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        match.saleDate.$lte = end
      }
    }

    const report = await Invoice.aggregate([
      { $match: match },
      { $unwind: '$items' },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$saleDate' } },
            itemId: '$items.item',
            itemName: '$items.itemName',
          },
          totalQtySold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
          invoiceCount: { $addToSet: '$_id' },
        },
      },
      {
        $group: {
          _id: '$_id.date',
          items: {
            $push: {
              itemId: '$_id.itemId',
              itemName: '$_id.itemName',
              qtySold: '$totalQtySold',
              revenue: '$totalRevenue',
            },
          },
          totalRevenue: { $sum: '$totalRevenue' },
          invoiceCount: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ])

    res.json({ success: true, data: report })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export default { createInvoice, getInvoice, getInvoices, salesReport }
