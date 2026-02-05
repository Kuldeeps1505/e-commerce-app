import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import productRoutes from './routes/products.js'
import enquiryRoutes from './routes/enquiries.js'
import supplierRoutes from './routes/suppliers.js'
import categoryRoutes from './routes/categories.js'
import authRoutes from './routes/auth.js'
import adminSupplierRoutes from "./routes/adminsupplier.js"
import adminEnquiryRoutes from "./routes/adminenquiry.js"
import profileRoutes from "./routes/profile.js";
import uploadRoutes from "./routes/upload.js";



dotenv.config()

const app = express()
const PORT = process.env.PORT || 7000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

mongoose.connect(process.env.MONGODB_URI || {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message)
    process.exit(1)
  })

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected')
})

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err.message)
})

app.use('/api/products', productRoutes)
app.use('/api/enquiries', enquiryRoutes)
app.use('/api/suppliers', supplierRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/auth', authRoutes)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

app.use("/api/admin/suppliers", adminSupplierRoutes);
app.use("/api/admin/enquiries", adminEnquiryRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/uploads", express.static("uploads"));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
