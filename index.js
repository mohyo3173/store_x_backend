import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import authRoute from './src/routes/user.route.js'
import invoiceRoute from './src/routes/invoices.route.js'
// import itemRoute from './src/routes/item.route.js'
import saleRoute from './src/routes/sales.route.js'
import storeTypesRoute from './src/routes/storetypes.route.js'
import dashboardRoute from './src/routes/dashboard.route.js'
import storeCategoryRoute from './src/routes/store-category.route.js'
import inventoryCategoryRoute from './src/routes/inventory-category.route.js'
import dotenv from 'dotenv'
const app = express()
const envFile = `.env.${process.env.NODE_ENV || 'development'}`
dotenv.config({ path: envFile })

import cookieParser from 'cookie-parser'
import morgan from 'morgan'

app.use(express.json())
app.use(cookieParser())

// CORS configuration
const origins = process.env.ORIGIN?.split(',') || ['http://localhost:3000']
console.log('Allowed origins:', origins)

app.use(
  cors({
    origin: origins, // frontend URLs allowed
    credentials: true, // crucial: allows cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))
// Routes
app.use('/api/v1/auth', authRoute)
// app.use('/api/v1/stores', itemRoute)
app.use('/api/v1/stores', invoiceRoute)
app.use('/api/v1/stores', saleRoute)
app.use('/api/v1/store-types', storeTypesRoute)
app.use('/api/v1/dashboard', dashboardRoute)
app.use('/api/v1/inventory-categories', inventoryCategoryRoute)
app.use('/api/v1/store-categories', storeCategoryRoute)
// Health check
app.get('/', (req, res) =>
  res.json({ status: 'Shop Backend Running', version: '1.0.0' })
)

// 404 handler
app.use((req, res) =>
  res.status(404).json({ success: false, message: 'Route not found' })
)

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res
    .status(err.status || 500)
    .json({ success: false, message: err.message || 'Internal Server Error' })
})

// DB + Server
const PORT = process.env.PORT || 5000
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/shopdb')
  .then(() => {
    console.log('✅ MongoDB connected')
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    )
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message)
    process.exit(1)
  })

export default app
