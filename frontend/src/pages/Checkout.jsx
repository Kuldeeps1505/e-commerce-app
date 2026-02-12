import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Wallet, Banknote, Lock, CheckCircle } from 'lucide-react'
import api from '../api'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'

export default function Checkout() {
  const navigate = useNavigate()
  const { cart, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('razorpay') // razorpay or cod

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  })

  useEffect(() => {
    fetchCart()
    loadRazorpayScript()
  }, [])

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart')
      setCartItems(res.data.cart.items || [])
      
      if (!res.data.cart.items || res.data.cart.items.length === 0) {
        toast.error('Your cart is empty')
        navigate('/cart')
      }
    } catch (error) {
      console.error('Fetch cart error:', error)
      toast.error('Failed to load cart')
      navigate('/cart')
    }
  }

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleInputChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    })
  }

  const validateForm = () => {
    const required = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode']
    
    for (const field of required) {
      if (!shippingAddress[field]?.trim()) {
        toast.error(`${field.replace(/([A-Z])/g, ' $1').trim()} is required`)
        return false
      }
    }

    if (shippingAddress.phone.length !== 10) {
      toast.error('Phone number must be 10 digits')
      return false
    }

    if (shippingAddress.pincode.length !== 6) {
      toast.error('Pincode must be 6 digits')
      return false
    }

    return true
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const calculateTax = (subtotal) => {
    return Math.round(subtotal * 0.18)
  }

  const calculateShipping = (subtotal) => {
    return subtotal > 5000 ? 0 : 100
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    return subtotal + calculateTax(subtotal) + calculateShipping(subtotal)
  }

  const handleRazorpayPayment = async () => {
    if (!validateForm()) return

    try {
      setLoading(true)

      // Create order
      const orderRes = await api.post('/order/create-payment', { shippingAddress })
      const { orderId, razorpayOrderId, amount, key } = orderRes.data.order

      const options = {
        key: key,
        amount: amount * 100,
        currency: 'INR',
        name: 'B2B Marketplace',
        description: 'Product Purchase',
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyRes = await api.post('/order/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderId
            })

            toast.success('Payment successful!')
            clearCart()
            navigate(`/order-success/${orderId}`)
          } catch (error) {
            console.error('Payment verification error:', error)
            toast.error('Payment verification failed')
          }
        },
        prefill: {
          name: shippingAddress.fullName,
          contact: shippingAddress.phone
        },
        theme: {
          color: '#2563eb'
        },
        modal: {
          ondismiss: function() {
            setLoading(false)
          }
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error('Create payment error:', error)
      toast.error(error.response?.data?.error || 'Failed to initiate payment')
    } finally {
      setLoading(false)
    }
  }

    const handleCODOrder = async () => {
      if (!validateForm()) return

      try {
        setLoading(true)

        const orderData = {
          shippingAddress,
          paymentMethod: 'cod',
          items: cartItems.map(item => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.price
          }))
        }

        const res = await api.post('/order/create-cod', orderData)
        
        toast.success('Order placed successfully!')
        clearCart()
        navigate(`/order-success/${res.data.order._id}`)
      } catch (error) {
        console.error('COD order error:', error)
        toast.error(error.response?.data?.error || 'Failed to place order')
      } finally {
        setLoading(false)
      }
    }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (paymentMethod === 'razorpay') {
      handleRazorpayPayment()
    } else {
      handleCODOrder()
    }
  }

  const subtotal = calculateSubtotal()
  const tax = calculateTax(subtotal)
  const shipping = calculateShipping(subtotal)
  const total = calculateTotal()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Shipping Address</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={shippingAddress.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleInputChange}
                      maxLength="10"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    name="addressLine1"
                    value={shippingAddress.addressLine1}
                    onChange={handleInputChange}
                    placeholder="House no, Building name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    name="addressLine2"
                    value={shippingAddress.addressLine2}
                    onChange={handleInputChange}
                    placeholder="Street, Area (optional)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={shippingAddress.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={shippingAddress.pincode}
                      onChange={handleInputChange}
                      maxLength="6"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Payment Method</h2>

              <div className="space-y-3">
                {/* Razorpay */}
                <label className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition ${
                  paymentMethod === 'razorpay' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <CreditCard className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Card / UPI / Wallet</p>
                      <p className="text-sm text-gray-500">Pay securely via Razorpay</p>
                    </div>
                  </div>
                  <Lock className="text-green-600" size={20} />
                </label>

                {/* Cash on Delivery */}
                <label className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition ${
                  paymentMethod === 'cod' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Banknote className="text-green-600" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Cash on Delivery</p>
                      <p className="text-sm text-gray-500">Pay when you receive</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 mb-6 max-h-48 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.product._id} className="flex gap-3">
                    <img
                      src={item.product.images?.[0]}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded border"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 line-clamp-1">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold text-gray-800">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3 mb-6">
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
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between text-xl font-bold text-gray-800">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock size={20} />
                    {paymentMethod === 'razorpay' ? 'Pay Now' : 'Place Order'}
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                <Lock className="inline mr-1" size={12} />
                Your payment information is secure
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}