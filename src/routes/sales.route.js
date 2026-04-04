import express from 'express'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { roleAuthMiddleware } from '../middlewares/role.middleware.js'
import { ownStoreMiddleware } from '../middlewares/store.middleware.js'
import controller from '../controllers/invoice.controller.js'
const router = express.Router()
router.get(
  '/:storeId/sales-report',
  authMiddleware,
  roleAuthMiddleware('super-admin', 'store-owner'),
  ownStoreMiddleware,
  controller.salesReport
)
export default router