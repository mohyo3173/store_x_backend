import * as yup from 'yup'
import { email, password, name, role } from './common.js'

const signup = yup.object({
  name,
  email,
  password,
  role,

  is_active: yup.boolean().default(true),
})
const signin = yup.object({
  name,
  email,
  password,
  role,

  is_active: yup.boolean().default(true),
})

const update = yup.object({
  name: name.optional(),
  email: email.optional(),
  password: password.optional(),
  role: role.optional(),
  is_active: yup.boolean().optional(),
})

export default { signin, signup, update }
