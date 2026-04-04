import { StoreType } from "../models/store-type.model.js"



// GET /api/store-types  — public (for signup dropdown)
 const getAll = async (req, res) => {
  try {
    const types = await StoreType.find({ isActive: true }).populate(
      'createdBy',
      'name email'
    )
    res.json({ success: true, data: types })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// POST /api/store-types  — superadmin only
 const create = async (req, res) => {
  try {
    const { name, description, icon } = req.body
    if (!name)
      return res
        .status(400)
        .json({ success: false, message: 'Name is required' })
    const exists = await StoreType.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
    })
    if (exists)
      return res
        .status(400)
        .json({ success: false, message: 'Store type already exists' })

    const type = await StoreType.create({
      name,
      description,
      icon,
      createdBy: req.user._id,
    })
    res.status(201).json({ success: true, data: type })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// PUT /api/store-types/:id
 const update = async (req, res) => {
  try {
    const type = await StoreType.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!type)
      return res
        .status(404)
        .json({ success: false, message: 'Store type not found' })
    res.json({ success: true, data: type })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// DELETE /api/store-types/:id  — soft delete
 const remove = async (req, res) => {
  try {
    const type = await StoreType.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    )
    if (!type)
      return res
        .status(404)
        .json({ success: false, message: 'Store type not found' })
    res.json({ success: true, message: 'Store type deactivated' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export default {getAll,create,update,remove}
