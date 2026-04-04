import * as yup from 'yup'
import { descriptionField, isActiveField, nameField, urlField } from './common.js'

// ─── Store Category Schemas ──────────────────────────────────
const create = yup.object({
  name: nameField,
  description: descriptionField,
  icon_url: urlField,
  icon_name: yup.string().trim().max(100).nullable().optional(),
})

const update = yup.object({
  name: nameField.optional(),
  description: descriptionField,
  icon_url: urlField,
  icon_name: yup.string().trim().max(100).nullable().optional(),
  is_active: isActiveField,
})

export default { create, update }
