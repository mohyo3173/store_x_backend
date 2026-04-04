import express from 'express'
const router = express.Router()
import controller from '../controllers/user.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
// ─── AUTH ────────────────────────────────────────────────────────────────────
router.post('/signup', controller.signup)
router.post('/signin', controller.login)
router.get('/me', authMiddleware, controller.getMe)
export default router