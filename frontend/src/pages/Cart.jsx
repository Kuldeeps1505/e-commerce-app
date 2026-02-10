import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import api from '../api'

export default function Cart() {
  const navigate = useNavigate()
  const { cart, loading, updateCartItem, removeFromCart } = useCart()
  const [cartItems, setCartItems] = useState([])
  const [loadingItems, setLoadingItems] = useState(true)

  useEffect(() => {
    fetchCartWithProducts()
  }, [cart])

  const fetchCartWithProducts = async () => {
    try {
      setLoadingItems(true)
      const token = localStorage.getItem('token')

      if (token) {
        // Fetch from backend
        const res = await api.get('/cart')
        setCartItems(res.data.cart.items || [])
      } else {
        // Fetch products for localStorage cart
        const localCart = JSON.parse(localStorage.getItem('cart') || '{"items": []}')
        const productIds = localCart.items.map(item => item.productId)
        
        if (productIds.length > 0) {
          const productsData = await Promise.all(
            productIds.map(id => api.get(`/products/${id}`))
          )
          
          const items = localCart.items.map(item => {
            const productRes = productsData.find(res => res.data.product._id === item.productId)
            return {
              product: productRes?.data.product,
              quantity: item.quantity,
              price: productRes?.data.product.price.min
            }
          })
          
          setCartItems(items)
        } else {
          setCartItems([])
        }
      }
    } catch (error) {
      console.error('Fetch cart items error:', error)
      setCartItems([])
    } finally {
      setLoadingItems(false)
    }
  }

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return
    updateCartItem(productId, newQuantity)
  }

  const handleRemove = (productId) => {
    if (window.confirm('Remove this item from cart?')) {
      removeFromCart(productId)
    }
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const calculateTax = (subtotal) => {
    return Math.round(subtotal * 0.18) // 18% GST
  }

  const calculateShipping = (subtotal) => {
    return subtotal > 5000 ? 0 : 100 // Free shipping above ₹5000
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const tax = calculateTax(subtotal)
    const shipping = calculateShipping(subtotal)
    return subtotal + tax + shipping
  }

  if (loadingItems) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <ShoppingBag className="mx-auto h-24 w-24 text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some products to get started!</p>
            <Link 
              to="/category/all"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <ShoppingCart size={20} />
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const subtotal = calculateSubtotal()
  const tax = calculateTax(subtotal)
  const shipping = calculateShipping(subtotal)
  const total = calculateTotal()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <ShoppingCart className="text-blue-600" />
            Shopping Cart
          </h1>
          <p className="text-gray-600 mt-2">{cartItems.length} items in your cart</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.product._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.product.images?.[0] || '/placeholder.png'}
                      alt={item.product.name}
                      className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">
                          {item.product.category?.name}
                        </p>
                        <p className="text-lg font-bold text-blue-600">
                          ₹{item.price?.toLocaleString()}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemove(item.product._id)}
                        className="text-red-500 hover:text-red-700 transition"
                        disabled={loading}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 mt-4">
                      <span className="text-sm text-gray-600">Quantity:</span>
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                          disabled={loading || item.quantity <= 1}
                          className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="px-4 py-2 font-medium min-w-[60px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                          disabled={loading}
                          className="p-2 hover:bg-gray-100 disabled:opacity-50 transition"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <span className="text-sm text-gray-500">
                        (MOQ: {item.product.moq?.quantity} {item.product.moq?.unit})
                      </span>
                    </div>

                    {/* Subtotal */}
                    <div className="mt-3 text-right">
                      <span className="text-sm text-gray-600">Subtotal: </span>
                      <span className="font-bold text-gray-800">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (18% GST)</span>
                  <span>₹{tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
                {subtotal < 5000 && (
                  <p className="text-xs text-gray-500">
                    Add ₹{(5000 - subtotal).toLocaleString()} more for FREE shipping!
                  </p>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between text-xl font-bold text-gray-800">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Proceed to Checkout
                <ArrowRight size={20} />
              </button>

              <Link
                to="/category/all"
                className="block text-center text-blue-600 hover:text-blue-700 mt-4 text-sm"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}