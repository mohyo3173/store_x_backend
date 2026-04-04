import { Invoice } from '../models/invoice.model.js'
import { Item } from '../models/item.model.js'

import mongoose from 'mongoose'
import { User } from '../models/user.model.js'
import { Store } from '../models/store.model.js'
const getStoreId = (req) =>
  req.user.role === 'superadmin' ? req.params.storeId : req.user.store?._id

// GET /api/stores/:storeId/dashboard
const storeDashboard = async (req, res) => {
  try {
    const storeId = new mongoose.Types.ObjectId(getStoreId(req))

    // --- Inventory summary ---
    const inventoryStats = await Item.aggregate([
      { $match: { store: storeId, isActive: true } },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          totalStockValue: { $sum: { $multiply: ['$quantity', '$salePrice'] } },
          totalQuantity: { $sum: '$quantity' },
          lowStockItems: {
            $sum: { $cond: [{ $lte: ['$quantity', 5] }, 1, 0] },
          },
        },
      },
    ])

    // --- Sales summary (all time) ---
    const salesStats = await Invoice.aggregate([
      { $match: { store: storeId } },
      {
        $group: {
          _id: null,
          totalInvoices: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          totalItemsSold: { $sum: { $sum: '$items.quantity' } },
        },
      },
    ])

    // --- Sales today ---
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)
    const todaySales = await Invoice.aggregate([
      {
        $match: {
          store: storeId,
          saleDate: { $gte: todayStart, $lte: todayEnd },
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$totalAmount' },
          invoices: { $sum: 1 },
        },
      },
    ])

    // --- Sales last 7 days (chart data) ---
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    sevenDaysAgo.setHours(0, 0, 0, 0)
    const last7Days = await Invoice.aggregate([
      { $match: { store: storeId, saleDate: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$saleDate' } },
          revenue: { $sum: '$totalAmount' },
          invoices: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    // --- Top 5 selling items ---
    const topItems = await Invoice.aggregate([
      { $match: { store: storeId } },
      { $unwind: '$items' },
      {
        $group: {
          _id: { itemId: '$items.item', itemName: '$items.itemName' },
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ])

    res.json({
      success: true,
      data: {
        inventory: inventoryStats[0] || {
          totalItems: 0,
          totalStockValue: 0,
          totalQuantity: 0,
          lowStockItems: 0,
        },
        sales: salesStats[0] || {
          totalInvoices: 0,
          totalRevenue: 0,
          totalItemsSold: 0,
        },
        today: todaySales[0] || { revenue: 0, invoices: 0 },
        last7Days,
        topItems,
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/admin/dashboard  — superadmin only: all stores overview
const adminDashboard = async (req, res) => {
  try {
    const totalStores = await Store.countDocuments({ isActive: true })
    const totalUsers = await User.countDocuments({ isActive: true })

    const salesOverall = await Invoice.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalInvoices: { $sum: 1 },
        },
      },
    ])

    const topStores = await Invoice.aggregate([
      {
        $group: {
          _id: '$store',
          totalRevenue: { $sum: '$totalAmount' },
          invoices: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'stores',
          localField: '_id',
          foreignField: '_id',
          as: 'store',
        },
      },
      { $unwind: '$store' },
      {
        $project: {
          'store.name': 1,
          'store._id': 1,
          totalRevenue: 1,
          invoices: 1,
        },
      },
    ])

    res.json({
      success: true,
      data: {
        totalStores,
        totalUsers,
        sales: salesOverall[0] || { totalRevenue: 0, totalInvoices: 0 },
        topStores,
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export default { storeDashboard, adminDashboard }
