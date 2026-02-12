import express from 'express'
import Cart from '../models/cart.js'
import Product from '../models/Product.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name images price moq isActive')
    
    if (!cart) {
      // Create empty cart if doesn't exist
      cart = await Cart.create({ user: req.user._id, items: [] })
    }
    
    // Filter out inactive products
    cart.items = cart.items.filter(item => item.product && item.product.isActive)
    await cart.save()
    
    res.json({
      success: true,
      cart
    })
  } catch (error) {
    console.error('Get cart error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cart'
    })
  }
})

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
router.post('/add', protect, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body
    
    // Validation
    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required'
      })
    }
    
    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be at least 1'
      })
    }
    
    // Check if product exists and is active
    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }
    
    if (!product.isActive) {
      return res.status(400).json({
        success: false,
        error: 'This product is no longer available'
      })
    }
    
    // Check MOQ
    if (quantity > product.moq?.quantity) {
      return res.status(400).json({
        success: false,
        error: `Maximum order quantity is ${product.moq.quantity} ${product.moq.unit}`
      })
    }
    
    // Get or create cart
    let cart = await Cart.findOne({ user: req.user._id })
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] })
    }
    
    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    )
    
    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        price: product.price.min, // Use min price
        productSnapshot: {
          name: product.name,
          image: product.images[0],
          moq: product.moq
        }
      })
    }
    
    await cart.save()
    await cart.populate('items.product', 'name images price moq isActive')
    
    res.json({
      success: true,
      message: 'Item added to cart',
      cart
    })
  } catch (error) {
    console.error('Add to cart error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to add item to cart'
    })
  }
})

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private
router.put('/update', protect, async (req, res) => {
  try {
    const { productId, quantity } = req.body
    
    if (!productId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Product ID and quantity are required'
      })
    }
    
    if (quantity < 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantity cannot be negative'
      })
    }
    
    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      })
    }
    
    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    )
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Item not found in cart'
      })
    }
    
    if (quantity === 0) {
      // Remove item if quantity is 0
      cart.items.splice(itemIndex, 1)
    } else {
      // Validate MOQ
      const product = await Product.findById(productId)
      if (product && quantity < product.moq?.quantity) {
        return res.status(400).json({
          success: false,
          error: `Minimum order quantity is ${product.moq.quantity} ${product.moq.unit}`
        })
      }
      
      cart.items[itemIndex].quantity = quantity
    }
    
    await cart.save()
    await cart.populate('items.product', 'name images price moq isActive')
    
    res.json({
      success: true,
      message: 'Cart updated',
      cart
    })
  } catch (error) {
    console.error('Update cart error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update cart'
    })
  }
})

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:productId
// @access  Private
router.delete('/remove/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params
    
    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      })
    }
    
    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    )
    
    await cart.save()
    await cart.populate('items.product', 'name images price moq isActive')
    
    res.json({
      success: true,
      message: 'Item removed from cart',
      cart
    })
  } catch (error) {
    console.error('Remove from cart error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to remove item from cart'
    })
  }
})

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
router.delete('/clear', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      })
    }
    
    cart.items = []
    await cart.save()
    
    res.json({
      success: true,
      message: 'Cart cleared',
      cart
    })
  } catch (error) {
    console.error('Clear cart error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to clear cart'
    })
  }
})

// @desc    Sync cart (merge localStorage with database)
// @route   POST /api/cart/sync
// @access  Private
router.post('/sync', protect, async (req, res) => {
  try {
    const { items } = req.body
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid cart items'
      })
    }
    
    let cart = await Cart.findOne({ user: req.user._id })
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] })
    }
    
    // Merge items from localStorage
    for (const localItem of items) {
      const existingIndex = cart.items.findIndex(
        item => item.product.toString() === localItem.productId
      )
      
      const product = await Product.findById(localItem.productId)
      if (!product || !product.isActive) continue
      
      if (existingIndex > -1) {
        cart.items[existingIndex].quantity += localItem.quantity
      } else {
        cart.items.push({
          product: localItem.productId,
          quantity: localItem.quantity,
          price: product.price.min,
          productSnapshot: {
            name: product.name,
            image: product.images[0],
            moq: product.moq
          }
        })
      }
    }
    
    await cart.save()
    await cart.populate('items.product', 'name images price moq isActive')
    
    res.json({
      success: true,
      message: 'Cart synced',
      cart
    })
  } catch (error) {
    console.error('Sync cart error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to sync cart'
    })
  }
})

export default router