import { supabase } from '../db/client.js'

// GET /api/store-categories — public (for signup dropdown)
const getAll = async (req, res) => {
  try {
    const { data, error } = await supabase()
      .from('store_categories')
      .select('*, users(name, email)')
      .eq('is_active', true)

    if (error) throw error

    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// POST /api/store-categories — superadmin only
const create = async (req, res) => {
  try {
    const { name, description, icon_url, icon_name } = req.body

    if (!name)
      return res
        .status(400)
        .json({ success: false, message: 'Name is required' })

    // Check duplicate (case-insensitive)
    const { data: existing } = await supabase()
      .from('store_categories')
      .select('id')
      .ilike('name', name)
      .single()

    if (existing)
      return res
        .status(400)
        .json({ success: false, message: 'Store category already exists' })

    const { data, error } = await supabase()
      .from('store_categories')
      .insert({
        name,
        description,
        icon_url,
        icon_name,
        created_by: req.user.id,
      })
      .select()
      .single()

    if (error) throw error

    res.status(201).json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// PUT /api/store-categories/:id
const update = async (req, res) => {
  try {
    const { data, error } = await supabase()
      .from('store_categories')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error
    if (!data)
      return res
        .status(404)
        .json({ success: false, message: 'Store category not found' })

    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// DELETE /api/store-categories/:id — soft delete
const remove = async (req, res) => {
  try {
    const { data, error } = await supabase()
      .from('store_categories')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error
    if (!data)
      return res
        .status(404)
        .json({ success: false, message: 'Store category not found' })

    res.json({ success: true, message: 'Store category deactivated' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export default { getAll, create, update, remove }
