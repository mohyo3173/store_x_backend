import express from 'express'
const router = express.Router()
import controller from '../controllers/storetype.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { roleAuthMiddleware } from '../middlewares/role.middleware.js'
import validation from '../validation/storeCategory.schema.js'
import { validate } from '../middlewares/validate.js'
router.get('/', controller.getAll)
router.post(
  '/',
  authMiddleware,
  roleAuthMiddleware('super-admin'),
  validate(validation.create),
  controller.create
)
router.put(
  '/:id',
  authMiddleware,

  roleAuthMiddleware('super-admin'),
  validate(validation.update),
  controller.update
)
router.delete(
  '/:id',
  authMiddleware,
  roleAuthMiddleware('super-admin'),
  controller.remove
)
export default router
