import mongoose from 'mongoose'

const supplierSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  contactPerson: { type: String, required: true },
  email: { type: String, required: true, unique: true, sparse: true },
  phone: { type: String, required: true },
  businessType: { 
    type: String, 
    enum: ['manufacturer', 'exporter', 'wholesaler', 'retailer'],
    required: true 
  },
  address: {
    street: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: 'India' },
    pincode: String
  },
  categoryOption: { 
    type: String, 
    enum: ['Ayurveda & Herbal', 'Electronics', 'Agriculture', 'Textiles', 'Machinery', 'Chemicals', 'Food Products'],
    required: true 
  },
  productDescription: { type: String },
  
  
  
}, { timestamps: true })

export default mongoose.model('Supplier', supplierSchema)
