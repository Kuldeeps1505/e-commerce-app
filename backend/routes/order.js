import express from 'express'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import Order from '../models/order.js'
import Cart from '../models/cart.js'
import Product from '../models/Product.js'
import { protect, admin } from '../middleware/auth.js'
import { v4 as uuid } from "uuid";


const router = express.Router()

// Initialize Razorpay
//const razorpay = new Razorpay({
  //key_id: process.env.RAZORPAY_KEY_ID,
  //key_secret: process.env.RAZORPAY_KEY_SECRET
//})

// @desc    Create Razorpay order
// @route   POST /api/orders/create-payment
// @access  Private
router.post('/create-payment', protect, async (req, res) => {
  try {
    const { shippingAddress } = req.body
    
    // Validation
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || 
        !shippingAddress.addressLine1 || !shippingAddress.city || 
        !shippingAddress.state || !shippingAddress.pincode) {
      return res.status(400).json({
        success: false,
        error: 'Complete shipping address is required'
      })
    }
    
    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product')
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Your cart is empty'
      })
    }
    
    // Validate all products are active and in stock
    for (const item of cart.items) {
      if (!item.product || !item.product.isActive) {
        return res.status(400).json({
          success: false,
          error: `Product ${item.productSnapshot?.name || 'unknown'} is no longer available`
        })
      }
    }
    
    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    )
    const tax = Math.round(subtotal * 0.18) // 18% GST
    const shippingCost = subtotal > 5000 ? 0 : 100 // Free shipping above ₹5000
    const total = subtotal + tax + shippingCost
    
    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: total * 100, // Amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        userName: req.user.name
      }
    })
    
    // Prepare order items with snapshots
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      productSnapshot: {
        name: item.product.name,
        image: item.product.images[0],
        description: item.product.description,
        category: item.product.category?.name || 'Uncategorized'
      },
      quantity: item.quantity,
      price: item.price,
      subtotal: item.price * item.quantity
    }))
    
    // Create order in database (pending state)
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      subtotal,
      tax,
      shippingCost,
      total,
      shippingAddress,
      payment: {
        method: 'razorpay',
        status: 'pending',
        razorpayOrderId: razorpayOrder.id
      },
      status: 'pending'
    })
    
    res.json({
      success: true,
      order: {
        orderId: order._id,
        razorpayOrderId: razorpayOrder.id,
        amount: total,
        currency: 'INR',
        key: process.env.RAZORPAY_KEY_ID
      }
    })
  } catch (error) {
    console.error('Create payment error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create payment order'
    })
  }
})

// @desc    Verify payment and confirm order
// @route   POST /api/orders/verify-payment
// @access  Private
router.post('/verify-payment', protect, async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      orderId 
    } = req.body
    
    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex')
    
    if (razorpay_signature !== expectedSign) {
      // Payment verification failed
      await Order.findByIdAndUpdate(orderId, {
        'payment.status': 'failed',
        'payment.failureReason': 'Signature verification failed',
        status: 'cancelled'
      })
      
      return res.status(400).json({
        success: false,
        error: 'Payment verification failed'
      })
    }
    
    // Payment verified - update order
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        'payment.status': 'completed',
        'payment.razorpayPaymentId': razorpay_payment_id,
        'payment.razorpaySignature': razorpay_signature,
        'payment.paidAt': new Date(),
        status: 'confirmed'
      },
      { new: true }
    ).populate('items.product')
    
    // Clear user's cart
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [] }
    )
    
    // TODO: Send confirmation email
    // await sendOrderConfirmationEmail(order)
    
    res.json({
      success: true,
      message: 'Payment verified successfully',
      order
    })
  } catch (error) {
    console.error('Verify payment error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to verify payment'
    })
  }
})

// @desc    Get user orders
// @route   GET /api/orders/my-orders
// @access  Private
router.get('/my-orders', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit
    
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-adminNotes')
    
    const total = await Order.countDocuments({ user: req.user._id })
    
    res.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get orders error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders'
    })
  }
})

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name images')
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      })
    }
    
    // Check if user owns this order (or is admin)
    if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this order'
      })
    }
    
    res.json({
      success: true,
      order
    })
  } catch (error) {
    console.error('Get order error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order'
    })
  }
})

// @desc    Track order by order number
// @route   GET /api/orders/track/:orderNumber
// @access  Public (with order number)
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber })
      .select('orderNumber status statusHistory tracking createdAt shippedAt deliveredAt')
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found. Please check your order number.'
      })
    }
    
    res.json({
      success: true,
      order
    })
  } catch (error) {
    console.error('Track order error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to track order'
    })
  }
})

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const { reason } = req.body
    
    const order = await Order.findById(req.params.id)
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      })
    }
    
    // Check ownership
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized'
      })
    }
    
    // Can only cancel pending or confirmed orders
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        error: 'Order cannot be cancelled at this stage'
      })
    }
    
    order.status = 'cancelled'
    order.cancellation = {
      reason: reason || 'Cancelled by user',
      cancelledBy: 'user',
      refundStatus: order.payment.status === 'completed' ? 'pending' : 'not_applicable'
    }
    
    await order.save()
    
    // TODO: Process refund if payment was completed
    
    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order
    })
  } catch (error) {
    console.error('Cancel order error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to cancel order'
    })
  }
})

// ==================== ADMIN ROUTES ====================

// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
router.get('/admin/all', protect, admin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit
    const status = req.query.status
    
    const query = status ? { status } : {}
    
    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
    
    const total = await Order.countDocuments(query)
    
    res.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get all orders error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders'
    })
  }
})

// @desc    Update order status (Admin)
// @route   PUT /api/orders/admin/:id/status
// @access  Private/Admin
router.put('/admin/:id/status', protect, admin, async (req, res) => {
  try {
    const { status, note, trackingNumber, carrier } = req.body
    
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      })
    }
    
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      })
    }
    
    order.status = status
    
    // Add to status history
    order.statusHistory.push({
      status,
      note,
      updatedBy: req.user._id
    })
    
    // Update tracking if provided
    if (status === 'shipped' && trackingNumber) {
      order.tracking = {
        ...order.tracking,
        trackingNumber,
        carrier: carrier || order.tracking?.carrier
      }
    }
    
    await order.save()
    
    // TODO: Send status update email to customer
    
    res.json({
      success: true,
      message: 'Order status updated',
      order
    })
  } catch (error) {
    console.error('Update order status error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update order status'
    })
  }
})

// @desc    Get order statistics (Admin)
// @route   GET /api/orders/admin/stats
// @access  Private/Admin
router.get('/admin/stats', protect, admin, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments()
    const pendingOrders = await Order.countDocuments({ status: 'pending' })
    const processingOrders = await Order.countDocuments({ status: 'processing' })
    const shippedOrders = await Order.countDocuments({ status: 'shipped' })
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' })
    
    // Revenue calculation
    const revenueResult = await Order.aggregate([
      { $match: { 'payment.status': 'completed' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ])
    const totalRevenue = revenueResult[0]?.total || 0
    
    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name email')
    
    res.json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        totalRevenue
      },
      recentOrders
    })
  } catch (error) {
    console.error('Get order stats error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order statistics'
    })
  }
})






router.post('/create-cod', protect, async (req, res) => {
  try {
    const { shippingAddress, items } = req.body
    
    // Validation
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || 
        !shippingAddress.addressLine1 || !shippingAddress.city || 
        !shippingAddress.state || !shippingAddress.pincode) {
      return res.status(400).json({
        success: false,
        error: 'Complete shipping address is required'
      })
    }
    
    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product')
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Your cart is empty'
      })
    }
    
    // Validate all products are active
    for (const item of cart.items) {
      if (!item.product || !item.product.isActive) {
        return res.status(400).json({
          success: false,
          error: `Product ${item.productSnapshot?.name || 'unknown'} is no longer available`
        })
      }
    }
    
    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    )
    const tax = Math.round(subtotal * 0.18) // 18% GST
    const shippingCost = subtotal > 5000 ? 0 : 100
    const total = subtotal + tax + shippingCost
    
    // Prepare order items
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      productSnapshot: {
        name: item.product.name,
        image: item.product.images[0],
        description: item.product.description,
        category: item.product.category?.name || 'Uncategorized'
      },
      quantity: item.quantity,
      price: item.price,
      subtotal: item.price * item.quantity
    }))
    

    const orderNumber = "ORD-" + uuid().slice(0, 8);


    // Create COD order
    const order = await Order.create({
      orderNumber,
      user: req.user._id,
      items: orderItems,
      subtotal,
      tax,
      shippingCost,
      total,
      shippingAddress,
      payment: {
        method: 'cod',
        status: 'pending' // Will be marked completed on delivery
      },
      status: 'confirmed' // COD orders are auto-confirmed
    })
    
    // Clear user's cart
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [] }
    )
    
    // TODO: Send order confirmation email
    
    res.json({
      success: true,
      message: 'COD order placed successfully',
      order
    })
  } catch (error) {
    console.error('Create COD order error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create COD order'
    })
  }
})

export default router