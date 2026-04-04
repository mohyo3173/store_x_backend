import './src/config/env.js'

import app from './src/app.js'
import mongoose from 'mongoose'

const startServer = () => {
  const PORT = process.env.PORT||5000

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
}
startServer()
