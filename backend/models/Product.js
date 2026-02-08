import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, sparse: true },
  description: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  price: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    currency: { type: String, default: 'INR' }
  },
  moq: {
    quantity: { type: Number, required: true },
    unit: { type: String, required: true }
  },
  images: [{ type: String, required: true }],
  attributes: [{
    key: String,
    value: String
  }],
  specifications: [{
    key: String,
    value: String
  }],
  views: { type: Number, default: 0 },
  enquiries: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true })

productSchema.index({ name: 'text', description: 'text' })

export default mongoose.model('Product', productSchema)
