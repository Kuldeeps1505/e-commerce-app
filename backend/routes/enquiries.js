import express from 'express'
import Enquiry from '../models/Enquiry.js'
import Product from '../models/Product.js'

import { protect } from "../middleware/auth.js";


const router = express.Router()

router.get('/',protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const query = status ? { status } : {}

      if (req.user.role !== "admin") {
      query.user = req.user._id;
    }
    const enquiries = await Enquiry.find(query)
      .populate('product')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort('-createdAt')
    
    const count = await Enquiry.countDocuments(query)
    
    res.json({
      enquiries,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})


router.post('/', protect, async (req, res) => {
  try {
    const { product, name, email, phone, message, enquiryType, pincode } = req.body
    
    // Validation
    if (!product || !name || !email || !phone || !message) {
      return res.status(400).json({ error: 'Product, name, email, phone, and message are required' })
    }

    // Create enquiry
    const enquiry = new Enquiry({
      user: req.user._id,
      product: product,  // ✅ Changed from productId to product
      name,
      email,
      phone,
      message,
      enquiryType: enquiryType || 'product',
      pincode: pincode || ''
    })
    
    const savedEnquiry = await enquiry.save()
    
    // Populate product for response
    await savedEnquiry.populate('product')
    
    // Increment enquiry count on product (optional)
    await Product.findByIdAndUpdate(product, { $inc: { enquiries: 1 } })
    
    console.log('✅ Enquiry created:', savedEnquiry._id)
    
    res.status(201).json({ 
      message: 'Enquiry submitted successfully',
      enquiry: savedEnquiry 
    })
  } catch (error) {
    console.error('❌ Enquiry submission error:', error.message)
    res.status(400).json({ error: error.message })
  }
})



router.patch('/:id/status', async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    )
    res.json(enquiry)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
