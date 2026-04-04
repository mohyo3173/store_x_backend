import Item from '../models/item.model.js'

const getStoreId = (req) =>
  req.user.role === 'superadmin' ? req.params.storeId : req.user.store?._id

// GET /api/stores/:storeId/items
const getItems = async (req, res) => {
  try {
    const storeId = getStoreId(req)
    const { category, search, lowStock } = req.query
    const filter = { store: storeId, isActive: true }
    if (category) filter.category = category
    if (search) filter.name = { $regex: search, $options: 'i' }
    if (lowStock) filter.quantity = { $lte: Number(lowStock) }

    const items = await Item.find(filter).sort({ name: 1 })
    res.json({ success: true, count: items.length, data: items })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/stores/:storeId/items/:id
const getItem = async (req, res) => {
  try {
    const item = await Item.findOne({
      _id: req.params.id,
      store: getStoreId(req),
    })
    if (!item)
      return res.status(404).json({ success: false, message: 'Item not found' })
    res.json({ success: true, data: item })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// POST /api/stores/:storeId/items
const createItem = async (req, res) => {
  try {
    const storeId = getStoreId(req)
    const {
      name,
      description,
      sku,
      category,
      unit,
      quantity,
      costPrice,
      salePrice,
      taxPercent,
      image,
    } = req.body

    if (!name || salePrice === undefined) {
      return res
        .status(400)
        .json({ success: false, message: 'name and salePrice are required' })
    }

    const item = await Item.create({
      store: storeId,
      name,
      description,
      sku,
      category,
      unit,
      quantity,
      costPrice,
      salePrice,
      taxPercent,
      image,
      createdBy: req.user._id,
    })
    res.status(201).json({ success: true, data: item })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// PUT /api/stores/:storeId/items/:id
const updateItem = async (req, res) => {
  try {
    const item = await Item.findOneAndUpdate(
      { _id: req.params.id, store: getStoreId(req) },
      req.body,
      { new: true, runValidators: true }
    )
    if (!item)
      return res.status(404).json({ success: false, message: 'Item not found' })
    res.json({ success: true, data: item })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// DELETE /api/stores/:storeId/items/:id  — soft delete
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findOneAndUpdate(
      { _id: req.params.id, store: getStoreId(req) },
      { isActive: false },
      { new: true }
    )
    if (!item)
      return res.status(404).json({ success: false, message: 'Item not found' })
    res.json({ success: true, message: 'Item removed' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// PATCH /api/stores/:storeId/items/:id/stock  — adjust stock manually
const adjustStock = async (req, res) => {
  try {
    const { quantity, operation } = req.body // operation: 'add' | 'set'
    const item = await Item.findOne({
      _id: req.params.id,
      store: getStoreId(req),
    })
    if (!item)
      return res.status(404).json({ success: false, message: 'Item not found' })

    if (operation === 'add')
      item.quantity = Math.max(0, item.quantity + Number(quantity))
    else item.quantity = Math.max(0, Number(quantity))

    await item.save()
    res.json({ success: true, data: item })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}
export default {
  adjustStock,
  deleteItem,
  getItem,
  getItems,
  createItem,
  updateItem,
}
