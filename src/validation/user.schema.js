import * as yup from 'yup'
import {
  emailField,
  passwordField,
  nameField,
  roleField,
  storeNameField,
  isActiveField,
  idField,
} from './common.js'

export const signup = yup.object({
  name: nameField,
  email: emailField,
  password: passwordField,
  role: roleField,
  is_active: isActiveField,

  storeName: storeNameField.when('role', {
    is: 'store-owner',
    then: (schema) =>
      schema.required('Store name is required for store owners'),
    otherwise: (schema) => schema.optional().nullable(),
  }),

  storeTypeId: idField.when('role', {
    is: 'store-owner',
    then: (schema) =>
      schema.required('Store type is required for store owners'),
    otherwise: (schema) => schema.optional().nullable(),
  }),

  storeAddress: yup.string().trim().max(255).nullable().optional(),
  storePhone: yup.string().trim().max(20).nullable().optional(),
})
const signin = yup.object({
  email: emailField,
  password: passwordField,
})

const update = yup.object({
  name: nameField.optional(),
  email: emailField.optional(),
  password: passwordField.optional(),
  role: roleField.optional(),
  is_active: yup.boolean().optional(),
})

export default { signin, signup, update }
