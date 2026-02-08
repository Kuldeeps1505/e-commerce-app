import mongoose from 'mongoose'

const enquirySchema = new mongoose.Schema({
  user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
   required: true,
  },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  name: { type: String },
  email: { type: String },
  phone: { type: String},
  pincode: String,
  enquiryType: { 
    type: String, 
    enum: ['product', 'bulk', 'sample'],
    default: 'product'
  },
  message: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['new', 'responded', 'closed'],
    default: 'new'
  },
  adminResponse: {
  message: String,
  respondedAt: Date,
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
     // admin
  }
  },
}, { timestamps: true })

export default mongoose.model('Enquiry', enquirySchema)
