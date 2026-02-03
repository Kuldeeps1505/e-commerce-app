import express from 'express'
import Supplier from '../models/Supplier.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const query = status ? { status } : {}
    
    const suppliers = await Supplier.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort('-createdAt')
    
    const count = await Supplier.countDocuments(query)
    
    res.json({
      suppliers,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { companyName, email, phone, businessType, address, categoryOption } = req.body
    
    // Validate required fields
    if (!companyName || !email || !phone || !businessType || !address || !categoryOption) {
      return res.status(400).json({ 
        error: 'Missing required fields: companyName, email, phone, businessType, address, categoryOption' 
      })
    }

    const supplier = new Supplier(req.body)
    const savedSupplier = await supplier.save()
    
    console.log('✅ Supplier registered:', savedSupplier._id)
    res.status(201).json({ 
      message: 'Supplier registration submitted successfully',
      supplier: savedSupplier 
    })
  } catch (error) {
    console.error('❌ Supplier registration error:', error.message)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0]
      return res.status(400).json({ error: `Duplicate ${field}. Please use a unique value.` })
    }
    res.status(400).json({ error: error.message })
  }
})



export default router
