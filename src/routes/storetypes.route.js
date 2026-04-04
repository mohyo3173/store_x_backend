import express from 'express'
const router = express.Router()
import controller from '../controllers/storetype.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { roleAuthMiddleware } from '../middlewares/role.middleware.js'
router.get('/', controller.getAll)
router.post(
  '/',
  authMiddleware,
  roleAuthMiddleware('super-admin'),
  controller.create
)
router.put(
  '/:id',
  authMiddleware,
  roleAuthMiddleware('super-admin'),
  controller.update
)
router.delete(
  '/:id',
  authMiddleware,
  roleAuthMiddleware('super-admin'),
  controller.remove
)
export default router