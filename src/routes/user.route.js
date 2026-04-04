import express from 'express'
const router = express.Router()
import controller from '../controllers/user.controller.js'
import validation from '../validation/user.schema.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { validate } from '../middlewares/validate.js'
// ─── AUTH ────────────────────────────────────────────────────────────────────

router.post('/signup', validate(validation.signup), controller.signup)
router.post('/signin', validate(validation.signin), controller.login)
router.get('/me', authMiddleware, controller.getMe)
export default router
