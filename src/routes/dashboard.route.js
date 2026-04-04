import express from 'express'
const router = express.Router()
import controller from '../controllers/dashboard.controller.js'
import { roleAuthMiddleware } from '../middlewares/role.middleware.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { ownStoreMiddleware } from '../middlewares/store.middleware.js'

router.get(
  '/admin',
  authMiddleware,
  roleAuthMiddleware('super-admin'),
  ownStoreMiddleware,
  controller.adminDashboard
)
router.get(
  '/store-owner/:storeId',
  authMiddleware,
  roleAuthMiddleware('store-owner'),
  ownStoreMiddleware,
  controller.storeDashboard
)
export default router
