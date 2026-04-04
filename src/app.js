
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import authRoute from './routes/user.route.js'
import invoiceRoute from './routes/invoices.route.js'
// import itemRoute from './routes/item.route.js'
import saleRoute from './routes/sales.route.js'
import storeTypesRoute from './routes/storetypes.route.js'
import dashboardRoute from './routes/dashboard.route.js'
import storeCategoryRoute from './routes/store-category.route.js'
import inventoryCategoryRoute from './routes/inventory-category.route.js'

const app = express()

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

export default app
