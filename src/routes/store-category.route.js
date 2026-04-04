import express from 'express'
import controller from '../controllers/store-category.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { roleAuthMiddleware } from '../middlewares/role.middleware.js'

const router = express.Router()

router.get('/', controller.get)
router.use(authMiddleware, roleAuthMiddleware('super-admin'))

// CRUD
router.post('/', controller.create)
router.get('/:id', controller.getById)
router.put('/:id', controller.update)
router.delete('/:id', controller.remove)

export default router
