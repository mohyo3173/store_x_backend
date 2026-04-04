import * as yup from 'yup'

// ─── Primitives ──────────────────────────────────────────────
export const idField = yup
  .string()
  .uuid('Invalid ID format')
  .required('ID is required')

export const nameField = yup
  .string()
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be at most 100 characters')
  .required('Name is required')

export const emailField = yup
  .string()
  .trim()
  .lowercase()
  .email('Must be a valid email address')
  .required('Email is required')

export const passwordField = yup
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(64, 'Password must be at most 64 characters')
  .required('Password is required')

export const descriptionField = yup
  .string()
  .trim()
  .max(500, 'Description must be at most 500 characters')
  .nullable()
  .optional()

export const urlField = yup
  .string()
  .url('Must be a valid URL')
  .nullable()
  .optional()

export const roleField = yup
  .string()
  .oneOf(['super-admin', 'store-owner', 'user'], 'Invalid role')
  .required('Role is required')
export const storeNameField = yup.string().trim().min(2).max(100)
export const isActiveField = yup.boolean().default(true)
