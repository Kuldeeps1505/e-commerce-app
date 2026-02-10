import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { CheckCircle, X, ShoppingCart, Plus, Minus, Share2, Star, Package } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import api from '../api'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'

export default function ProductDetailPage() {
  const { productSlug } = useParams()
  const navigate = useNavigate()
  const { addToCart, loading: cartLoading } = useCart()
  
  const [selectedImage, setSelectedImage] = useState(0)
  const [showEnquiryModal, setShowEnquiryModal] = useState(false)
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    fetchProduct()
  }, [productSlug])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/products/${productSlug}`)
      
      const productData = response.data.product || response.data
      
      if (!productData) {
        throw new Error('Product not found')
      }
      
      setProduct(productData)
      
      const moqQuantity = productData.moq?.quantity || 1
      setQuantity(moqQuantity)
      
      // Fetch related products by category
      if (productData.category?._id || productData.category) {
        try {
          const categoryId = productData.category?._id || productData.category
          const relatedResponse = await api.get(`/products?category=${categoryId}&limit=6`)
          
          const filtered = relatedResponse.data.products?.filter(p => p._id !== productData._id) || []
          setRelatedProducts(filtered.slice(0, 6))
        } catch (error) {
          console.log('Could not fetch related products')
          try {
            const fallbackResponse = await api.get('/products?limit=8')
            const filtered = fallbackResponse.data.products?.filter(p => p._id !== productData._id) || []
            setRelatedProducts(filtered.slice(0, 6))
          } catch (fallbackError) {
            setRelatedProducts([])
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch product:', error)
      toast.error('Failed to load product')
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta
    const moqQuantity = product.moq?.quantity || 1

    
  if (!value) {
    setQuantity('')
    return
  }

  if (value < 1) {
    value = 1
  }
    
    if (newQuantity <= moqQuantity) {
      setQuantity(newQuantity)
    } else {
      toast.error(`Maxmium order quantity is ${moqQuantity} ${product.moq?.unit}`)
    }
  }

  const handleInputChange = (e) => {
  const maxQuantity = product.moq?.quantity || 1
  let value = parseInt(e.target.value)

  // if empty
  if (!value) {
    setQuantity('')
    return
  }

  if (value < 1) {
    value = 1
  }

  if (value > maxQuantity) {
    toast.error(`Maximum order quantity is ${maxQuantity} ${product.moq?.unit}`)
    value = maxQuantity
  }

  setQuantity(value)
}


  const handleAddToCart = async () => {
    if (!product) return

    try {
      setAddingToCart(true)
      await addToCart(product._id, quantity)
    } catch (error) {
      console.error('Add to cart error:', error)
    } finally {
      setAddingToCart(false)
    }
  }

  const handleBuyNow = async () => {
    await handleAddToCart()
    navigate('/cart')
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href
        })
      } catch (error) {
        console.log('Share failed:', error)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-24 w-24 text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
          <Link to="/products" className="text-blue-600 hover:underline">
            Browse Products
          </Link>
        </div>
      </div>
    )
  }

  const productImages = product.images?.length > 0 
    ? product.images 
    : ['https://via.placeholder.com/600']
    
  const price = product.price 
    ? `₹${product.price.min.toLocaleString()} `
    : 'Contact for price'
    
  const moq = product.moq 
    ? `${product.moq.quantity} ${product.moq.unit}`
    : 'N/A'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-sm text-gray-600">
            <Link to="/" className="hover:text-blue-600 transition">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/products" className="hover:text-blue-600 transition">Products</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-800 font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Product Details - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                {/* Image Gallery */}
                <div>
                  <div className="relative mb-4 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={productImages[selectedImage]}
                      alt={product.name}
                      className="w-full h-96 object-cover"
                    />
                    <button
                      onClick={handleShare}
                      className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-100 transition"
                    >
                      <Share2 size={20} className="text-gray-600" />
                    </button>
                  </div>
                  
                  
                  
                </div>

                {/* Product Info */}
                <div>
                  <div className="mb-4">
                    {product.category?.name && (
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full mb-2">
                        {product.category.name}
                      </span>
                    )}
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                      {product.name}
                    </h1>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={16} 
                            className={i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} 
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">(4.0)</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="text-3xl font-bold text-blue-600 mb-1">{price}</div>
                    <p className="text-gray-600">Per {product.moq?.unit || 'unit'}</p>
                  </div>

                  {/* Product Attributes */}
                  <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Maxmium Order:</span>
                      <span className="font-semibold text-gray-800">{moq}</span>
                    </div>
                    {product.attributes?.map((attr, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="text-gray-600">{attr.key}:</span>
                        <span className="font-semibold text-gray-800">{attr.value}</span>
                      </div>
                    ))}
                  </div>

                  
                {/* Quantity Selector */}
<div className="mb-6">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Quantity (Max: {product.moq?.quantity || 1} {product.moq?.unit})
  </label>

  <div className="flex items-center gap-4">
    <div className="flex items-center border border-gray-300 rounded-lg">
      
      {/* Minus */}
      <button
        onClick={() => handleQuantityChange(-1)}
        disabled={quantity <= 1}
        className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        <Minus size={15} />
      </button>

      {/* Value */}
      <input
  type="number"
  min="1"
  max={product.moq?.quantity || 1}
  value={quantity}
  onChange={handleInputChange}
  className="w-20 text-center outline-none"
/>
      

      {/* Plus */}
      <button
        onClick={() => handleQuantityChange(1)}
        disabled={quantity >= (product.moq?.quantity || 1)}
        className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        <Plus size={15} />
      </button>
    </div>

    <span className="text-sm text-gray-600">
      Total: ₹{((product.price?.min || 0) * quantity).toLocaleString()}
    </span>
  </div>
</div>









                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={handleAddToCart}
                      disabled={addingToCart || cartLoading}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart size={20} />
                      {addingToCart ? 'Adding...' : 'Add to Cart'}
                    </button>

                    <button
                      onClick={handleBuyNow}
                      disabled={addingToCart || cartLoading}
                      className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Buy Now
                    </button>

                    <button
                      onClick={() => setShowEnquiryModal(true)}
                      className="w-full border-2 border-blue-600 text-blue-600 py-3 rounded-lg hover:bg-blue-50 transition font-medium"
                    >
                      Send Inquiry
                    </button>
                  </div>

                  {/* Trust Badges */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <CheckCircle className="mx-auto mb-1 text-green-600" size={24} />
                        <p className="text-xs text-gray-600">Quality Assured</p>
                      </div>
                      <div>
                        <CheckCircle className="mx-auto mb-1 text-green-600" size={24} />
                        <p className="text-xs text-gray-600">Secure Payment</p>
                      </div>
                      <div>
                        <CheckCircle className="mx-auto mb-1 text-green-600" size={24} />
                        <p className="text-xs text-gray-600">Fast Shipping</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Sidebar - Description Only */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-800 mb-4">About This Product</h3>
              <div className="text-gray-700 text-sm leading-relaxed space-y-3">
                <p>{product.description}</p>
                
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section (Full Width Below) */}
        {relatedProducts.length > 4 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {relatedProducts.map(relatedProduct => (
                <ProductCard key={relatedProduct._id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Enquiry Modal */}
      {showEnquiryModal && (
        <EnquiryModal onClose={() => setShowEnquiryModal(false)} product={product} />
      )}
    </div>
  )
}

// Enquiry Modal Component
function EnquiryModal({ onClose, product }) {
  const [formData, setFormData] = useState({
    name: '', 
    email: '', 
    phone: '', 
    pincode: '', 
    enquiryType: 'product', 
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!product || !product._id) {
      toast.error('Product not loaded. Please wait.')
      return
    }

    setSubmitting(true)

    try {
      const enquiryData = {
        ...formData,
        product: product._id
      }

      await api.post('/enquiries', enquiryData)
      toast.success('Enquiry submitted successfully!')
      onClose()
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message
      toast.error(`Failed to submit enquiry: ${errorMsg}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Send Inquiry</h2>
        <p className="text-gray-600 mb-6">Get the best quote for {product.name}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
            <input
              type="text"
              placeholder="John Doe"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              placeholder="john@example.com"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
            <input
              type="tel"
              placeholder="9876543210"
              required
              maxLength="10"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pin Code</label>
            <input
              type="text"
              placeholder="400001"
              maxLength="6"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.pincode}
              onChange={(e) => setFormData({...formData, pincode: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Inquiry Type *</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.enquiryType}
              onChange={(e) => setFormData({...formData, enquiryType: e.target.value})}
            >
              <option value="product">Product Inquiry</option>
              <option value="bulk">Bulk Order</option>
              <option value="sample">Sample Request</option>
              <option value="pricing">Pricing Information</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
            <textarea
              placeholder="Tell us your requirements..."
              rows="4"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !product}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Inquiry'}
          </button>
        </form>
      </div>
    </div>
  )
}