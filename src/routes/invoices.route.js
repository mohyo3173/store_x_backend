import express from 'express'
const router = express.Router()
import controller from '../controllers/invoice.controller.js'
import { roleAuthMiddleware } from '../middlewares/role.middleware.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { ownStoreMiddleware } from '../middlewares/store.middleware.js'
router.post(
  '/:storeId/invoices',
  authMiddleware,
  roleAuthMiddleware('super-admin', 'store-owner'),
  ownStoreMiddleware,
  controller.createInvoice
)
router.get(
  '/:storeId/invoices',
  authMiddleware,
  roleAuthMiddleware('super-admin', 'store-owner'),
  ownStoreMiddleware,
  controller.getInvoices
)
router.get(
  '/:storeId/invoices/:id',
  authMiddleware,
  roleAuthMiddleware('super-admin', 'store-owner'),
  ownStoreMiddleware,
  controller.getInvoice
)
export default router