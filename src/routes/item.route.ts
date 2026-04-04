import express from 'express'
const router = express.Router()
import controller from '../controllers/Item.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { roleAuthMiddleware } from '../middlewares/role.middleware.js'
import { ownStoreMiddleware } from '../middlewares/store.middleware.js'
router.get(
  '/:storeId/items',
  authMiddleware,
  roleAuthMiddleware('super-admin', 'store-owner'),
  ownStoreMiddleware,
  controller.getItems
)
router.get(
  '/:storeId/items/:id',
  authMiddleware,
  roleAuthMiddleware('super-admin', 'store-owner'),
  ownStoreMiddleware,
  controller.getItem
)
router.post(
  '/:storeId/items',
  authMiddleware,
  roleAuthMiddleware('super-admin', 'store-owner'),
  ownStoreMiddleware,
  controller.createItem
)
router.put(
  '/:storeId/items/:id',
  authMiddleware,
  roleAuthMiddleware('super-admin', 'store-owner'),
  ownStoreMiddleware,
  controller.updateItem
)
router.delete(
  '/:storeId/items/:id',
  authMiddleware,
  roleAuthMiddleware('super-admin', 'store-owner'),
  ownStoreMiddleware,
  controller.deleteItem
)
router.patch(
  '/:storeId/items/:id/stock',
  authMiddleware,
  roleAuthMiddleware('superadmin', 'store_owner'),
  ownStoreMiddleware,
  controller.adjustStock
)
export default router