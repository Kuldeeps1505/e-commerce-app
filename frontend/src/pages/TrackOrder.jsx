import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Package, Truck, CheckCircle, XCircle, Clock, MapPin, Phone, Mail } from 'lucide-react'
import api from '../api'
import toast from 'react-hot-toast'

export default function TrackOrder() {
  const { orderNumber } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [trackingNumber, setTrackingNumber] = useState(orderNumber || '')

  useEffect(() => {
    if (orderNumber) {
      trackOrder(orderNumber)
    }
  }, [orderNumber])

  const trackOrder = async (number) => {
    try {
      setLoading(true)
      const res = await api.get(`/orders/track/${number}`)
      setOrder(res.data.order)
    } catch (error) {
      console.error('Track order error:', error)
      toast.error(error.response?.data?.error || 'Order not found')
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (trackingNumber.trim()) {
      navigate(`/track-order/${trackingNumber.trim()}`)
    }
  }

  const getStatusSteps = () => {
    return [
      {
        status: 'pending',
        label: 'Order Placed',
        icon: Package,
        description: 'Your order has been received'
      },
      {
        status: 'confirmed',
        label: 'Confirmed',
        icon: CheckCircle,
        description: 'Order confirmed and being prepared'
      },
      {
        status: 'processing',
        label: 'Processing',
        icon: Clock,
        description: 'Order is being processed'
      },
      {
        status: 'shipped',
        label: 'Shipped',
        icon: Truck,
        description: 'Order has been shipped'
      },
      {
        status: 'delivered',
        label: 'Delivered',
        icon: CheckCircle,
        description: 'Order has been delivered'
      }
    ]
  }

  const getCurrentStepIndex = () => {
    if (!order) return -1
    const steps = getStatusSteps()
    return steps.findIndex(step => step.status === order.status)
  }

  const formatDate = (date) => {
    if (!date) return null
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Track Your Order</h1>
          <p className="text-gray-600">Enter your order number to track your shipment</p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              placeholder="Enter Order Number (e.g., ORD-2602-000001)"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Track
            </button>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Order Found */}
        {!loading && order && (
          <div className="space-y-6">
            {/* Order Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Order #{order.orderNumber}</h2>
                  <p className="text-gray-600">Placed on {formatDate(order.createdAt)}</p>
                </div>
                <div className={`px-4 py-2 rounded-full font-medium ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                  order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </div>
              </div>

              {/* Tracking Timeline */}
              {order.status !== 'cancelled' && (
                <div className="relative">
                  {/* Progress Bar */}
                  <div className="absolute top-5 left-0 h-1 bg-gray-200 w-full">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${(getCurrentStepIndex() / (getStatusSteps().length - 1)) * 100}%` }}
                    ></div>
                  </div>

                  {/* Steps */}
                  <div className="relative grid grid-cols-2 md:grid-cols-5 gap-4">
                    {getStatusSteps().map((step, index) => {
                      const currentIndex = getCurrentStepIndex()
                      const isCompleted = index <= currentIndex
                      const isCurrent = index === currentIndex
                      const StepIcon = step.icon

                      return (
                        <div key={step.status} className="flex flex-col items-center text-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                            isCompleted 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 text-gray-400'
                          } ${isCurrent ? 'ring-4 ring-blue-200' : ''}`}>
                            <StepIcon size={20} />
                          </div>
                          <p className={`text-xs font-medium mb-1 ${
                            isCompleted ? 'text-gray-800' : 'text-gray-400'
                          }`}>
                            {step.label}
                          </p>
                          <p className="text-xs text-gray-500 hidden md:block">
                            {step.description}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Cancelled Status */}
              {order.status === 'cancelled' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <XCircle className="text-red-600 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <p className="font-semibold text-red-800">Order Cancelled</p>
                    <p className="text-sm text-red-600 mt-1">
                      This order has been cancelled
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Tracking Info (if shipped) */}
            {order.tracking?.trackingNumber && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Truck className="text-blue-600" />
                  Shipping Details
                </h3>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Carrier:</span>
                    <span className="font-medium">{order.tracking.carrier || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tracking Number:</span>
                    <span className="font-mono font-medium">{order.tracking.trackingNumber}</span>
                  </div>
                  {order.tracking.estimatedDelivery && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Delivery:</span>
                      <span className="font-medium">{formatDate(order.tracking.estimatedDelivery)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Status History */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Order History</h3>
                <div className="space-y-4">
                  {order.statusHistory.slice().reverse().map((history, index) => (
                    <div key={index} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="text-blue-600" size={20} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 capitalize">
                          {history.status.replace('_', ' ')}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(history.timestamp)}
                        </p>
                        {history.note && (
                          <p className="text-sm text-gray-500 mt-1">{history.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Need Help */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Need Help?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Phone className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Call us</p>
                    <p className="font-semibold text-gray-800">1800-123-4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email us</p>
                    <p className="font-semibold text-gray-800">support@b2b.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Order Found */}
        {!loading && !order && orderNumber && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Package className="mx-auto h-24 w-24 text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h2>
            <p className="text-gray-600">
              We couldn't find an order with number: <span className="font-mono font-semibold">{orderNumber}</span>
            </p>
            <p className="text-gray-600 mt-2">Please check the order number and try again.</p>
          </div>
        )}
      </div>
    </div>
  )
}