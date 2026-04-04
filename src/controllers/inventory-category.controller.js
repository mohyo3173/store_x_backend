import { InventoryCategory } from '../models/inventroy-category.model.js'

const create = async (req, res) => {
  try {
    const { name, storeTypeId, description } = req.body

    const user = req.user
    console.log('Creating inventory category:', req.body)
    let category

    // SUPER ADMIN
    if (user.role === 'super-admin') {
      category = await InventoryCategory.create({
        name,
        description,
        storeCategory: storeTypeId,
        createdBy: user._id,
        createdByRole: user.role,
        isGlobal: true,
        store: null,
      })
    }

    // STORE OWNER
    else if (user.role === 'store-owner') {
      category = await InventoryCategory.create({
        name,
        description,
        storeCategory: storeTypeId,
        createdBy: user._id,
        createdByRole: user.role,
        store: user.store,
        isGlobal: false,
      })
    }

    return res.status(201).json({
      success: true,
      category,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}
const get = async (req, res) => {
  try {
    const user = req.user

    // 🔹 Query params
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const search = req.query.search || ''

    const skip = (page - 1) * limit

    let filter = {}

    // 🔹 Role-based filter
    if (user.role === 'super-admin') {
      filter = { isGlobal: true }
    } else {
      const store = await Store.findById(user.store)

      filter = {
        storeCategory: store.storeCategory,
        $or: [{ isGlobal: true }, { store: store._id }],
      }
    }

    // 🔹 Add search
    if (search) {
      filter.$and = [
        ...(filter.$and || []),
        {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ],
        },
      ]
    }

    // 🔹 Fetch paginated data
    const categories = await InventoryCategory.find(filter)
      .populate('storeCategory', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })

    // 🔹 Total count
    const total = await InventoryCategory.countDocuments(filter)

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
    const user = req.user

    const category = await InventoryCategory.findById(id).populate(
      'storeCategory',
      'name'
    )

    if (!category)
      return res.status(404).json({ message: 'Category not found' })

    // SUPER ADMIN → only global
    if (user.role === 'superadmin') {
      if (!category.isGlobal)
        return res.status(403).json({ message: 'Not allowed' })
    }

    // STORE OWNER → global OR own
    else {
      if (
        !category.isGlobal &&
        category.store?.toString() !== user.store?.toString()
      ) {
        return res.status(403).json({ message: 'Not allowed' })
      }
    }

    res.json({ success: true, category })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
const update = async (req, res) => {
  try {
    const { id } = req.params
    const { name } = req.body
    const user = req.user

    const category = await InventoryCategory.findById(id)

    if (!category)
      return res.status(404).json({ message: 'Category not found' })

    // SUPER ADMIN → only global
    if (user.role === 'superadmin') {
      if (!category.isGlobal)
        return res.status(403).json({ message: 'Not allowed' })
    }

    // STORE OWNER → only own
    else {
      if (category.store?.toString() !== user.store?.toString()) {
        return res.status(403).json({ message: 'Not allowed' })
      }
    }

    category.name = name || category.name
    await category.save()

    res.json({ success: true, category })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const remove = async (req, res) => {
  try {
    const { id } = req.params
    const user = req.user

    const category = await InventoryCategory.findById(id)

    if (!category)
      return res.status(404).json({ message: 'Category not found' })

    // SUPER ADMIN → only global
    if (user.role === 'superadmin') {
      if (!category.isGlobal)
        return res.status(403).json({ message: 'Not allowed' })
    }

    // STORE OWNER → only own
    else {
      if (category.store?.toString() !== user.store?.toString()) {
        return res.status(403).json({ message: 'Not allowed' })
      }
    }

    await category.deleteOne()

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
