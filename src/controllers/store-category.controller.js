import { StoreCategory } from '../models/store-category.js'

const create = async (req, res) => {
  try {
    const user = req.user

    const { name, description } = req.body

    const exists = await StoreCategory.findOne({ name })
    if (exists) {
      return res.status(409).json({ message: 'Category already exists' })
    }

    const category = await StoreCategory.create({
      name,
      description,
      createdBy: user._id,
    })

    res.status(201).json({ success: true, category })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
const get = async (req, res) => {
  try {
    // 🔹 Query params
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const search = req.query.search || ''

    const skip = (page - 1) * limit

    // 🔹 Search filter
    const filter = {
      ...(req?.user?.role === 'store-owner' ? { isActive: true } : {}),
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } }, // search by name
        { description: { $regex: search, $options: 'i' } }, // optional
        // add more fields if needed
      ]
    }

    // 🔹 Query DB
    const categories = await StoreCategory.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })

    // 🔹 Total count for pagination
    const total = await StoreCategory.countDocuments(filter)

    res.json({
      success: true,
      data: {
        categories,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
const getById = async (req, res) => {
  try {
    const { id } = req.params

    const category = await StoreCategory.findById(id)

    if (!category || !category.isActive) {
      return res.status(404).json({ message: 'Category not found' })
    }

    res.json({ success: true, category })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
const update = async (req, res) => {
  try {
    const user = req.user
    const { id } = req.params
    const { name, description } = req.body

    const category = await StoreCategory.findById(id)

    if (!category) {
      return res.status(404).json({ message: 'Category not found' })
    }

    category.name = name || category.name
    category.description = description || category.description

    await category.save()

    res.json({ success: true, category })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const remove = async (req, res) => {
  try {
    const user = req.user
    const { id } = req.params

    const category = await StoreCategory.findById(id)

    if (!category) {
      return res.status(404).json({ message: 'Category not found' })
    }

    // Soft delete
    category.isActive = false
    await category.save()

    res.json({ success: true, message: 'Category deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
export default {
  create,
  get,
  getById,
  update,
  remove,
}
