import * as yup from 'yup'
import {
  descriptionField,
  iconField,
  isActiveField,
  nameField,
  urlField,
} from './common.js'

// ─── Store Category Schemas ──────────────────────────────────
const create = yup.object({
  name: nameField,
  description: descriptionField,
  icon_url: urlField,
  icon_name: iconField.optional(),
})

const update = yup.object({
  name: nameField.optional(),
  description: descriptionField,
  icon_url: urlField,
  icon_name: iconField.optional(),
  is_active: isActiveField,
})

export default { create, update }
