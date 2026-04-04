import * as yup from 'yup'

// Common reusable fields
export const email = yup
  .string()
  .email('Invalid email format')
  .required('Email is required')

export const password = yup
  .string()
  .min(6, 'Password must be at least 6 characters')
  .required('Password is required')

export const name = yup
  .string()
  .min(2, 'Name must be at least 2 characters')
  .required('Name is required')

export const role = yup
  .string()
  .oneOf(['super-admin', 'store-owner', 'user'], 'Invalid role')
  .required('Role is required')

export const isActive = yup.boolean().default(true)