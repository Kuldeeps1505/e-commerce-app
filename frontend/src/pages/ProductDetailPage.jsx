import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { MapPin, Phone, Mail, CheckCircle, X } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import api from '../api'
import { Link } from "react-router-dom";


export default function ProductDetailPage() {
  const { productSlug } = useParams()
  const [selectedImage, setSelectedImage] = useState(0)
  const [showEnquiryModal, setShowEnquiryModal] = useState(false)
  const [activeTab, setActiveTab] = useState('description')
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${productSlug}`)
        setProduct(response.data)
        
        // Fetch related products
        const relatedResponse = await api.get('/products?limit=4')
        setRelatedProducts(relatedResponse.data.products.filter(p => p.slug !== productSlug))
      } catch (error) {
        console.error('Failed to fetch product:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [productSlug])

  if (loading) {
    return (
      <div className="bg-surface min-h-screen flex items-center justify-center">
        <div className="text-slate-500">Loading product...</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="bg-surface min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Product Not Found</h2>
          <p className="text-slate-500">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : ['https://via.placeholder.com/600']
  const price = `₹${product.price.min} - ₹${product.price.max}`
  const moq = `${product.moq.quantity} ${product.moq.unit}`
  const supplierName = product.supplier?.companyName || 'Supplier'
  const supplierLocation = product.supplier?.address?.city 
    ? `${product.supplier.address.city}, ${product.supplier.address.state}, ${product.supplier.address.country}` 
    : 'India'

  return (
    <div className="bg-surface min-h-screen">
      <div className="bg-surface-elevated border-b border-surface-border py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-sm text-slate-500">
            <Link
              to="/"
                 className="hover:text-primary transition-colors font-medium"
                  >
                  Home
            </Link>
             {" / "}<span className="text-slate-800 font-medium">{productSlug}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-surface-elevated rounded-2xl shadow-soft border border-surface-border p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <img
                    src={productImages[selectedImage]}
                    alt="Product"
                    className="w-full rounded-lg mb-4"
                  />
                  <div className="flex gap-2">
                    {productImages.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        onClick={() => setSelectedImage(idx)}
                        className={`w-20 h-20 object-cover rounded-xl cursor-pointer border-2 transition-colors ${
                          selectedImage === idx ? 'border-primary' : 'border-surface-border'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-slate-800 mb-4">
                    {product.name}
                  </h1>
                  <div className="text-3xl font-bold text-primary mb-2">{price}</div>
                  <div className="text-gray-600 mb-4">Per {product.moq.unit}</div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">MOQ:</span>
                      <span className="font-semibold">{moq}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-semibold">{product.category?.name || 'N/A'}</span>
                    </div>
                    {product.attributes && product.attributes.length > 0 && product.attributes.map((attr, idx) => (
                      <div key={idx} className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">{attr.key}:</span>
                        <span className="font-semibold">{attr.value}</span>
                      </div>
                    ))}
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Packaging:</span>
                      <span className="font-semibold">25 Kg Bags</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowEnquiryModal(true)}
                    className="w-full btn-secondary py-3 text-lg mb-3"
                  >
                    Send Inquiry
                  </button>
                  <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 flex items-center justify-center">
                    <Phone size={18} className="mr-2" />
                    View Contact Details
                  </button>
                </div>
              </div>

              <div className="mt-8 border-t pt-6">
                <div className="flex gap-4 mb-6 border-b">
                  {['description', 'specifications'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-3 px-4 font-medium capitalize ${
                        activeTab === tab
                          ? 'border-b-2 border-primary text-primary'
                          : 'text-gray-600'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {activeTab === 'description' && (
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                )}

                {activeTab === 'specifications' && (
                  <div className="grid grid-cols-2 gap-4">
                    {product.specifications && product.specifications.length > 0 ? (
                      product.specifications.map((spec, idx) => (
                        <div key={idx}><strong>{spec.key}:</strong> {spec.value}</div>
                      ))
                    ) : (
                      <div className="col-span-2 text-gray-500">No specifications available</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <div className="flex items-center mb-4">
                <CheckCircle className="text-green-500 mr-2" size={24} />
                <span className="font-semibold text-lg">Verified Supplier</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{supplierName}</h3>
              <div className="text-sm text-gray-600 space-y-2 mb-4">
                <div className="flex items-center">
                  <MapPin size={16} className="mr-2" />
                  {supplierLocation}
                </div>
                {product.supplier?.businessType && (
                  <div>Business Type: {product.supplier.businessType.charAt(0).toUpperCase() + product.supplier.businessType.slice(1)}</div>
                )}
                <div>Years in Business: 15+ Years</div>
              </div>
              <button
                onClick={() => setShowEnquiryModal(true)}
                className="w-full btn-primary py-3 mb-2"
              >
                Contact Supplier
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(product => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </div>

      {showEnquiryModal && (
        <EnquiryModal onClose={() => setShowEnquiryModal(false)} product={product} />
      )}
    </div>
  )
}

function EnquiryModal({ onClose, product }) {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', pincode: '', enquiryType: 'product', message: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
  e.preventDefault()

  if (!product || !product._id) {
    alert("❌ Product not loaded. Please wait.")
    return
  }

  setSubmitting(true)

  try {
    const enquiryData = {
      ...formData,
      product: product._id
    }

    console.log('📤 Submitting enquiry:', enquiryData)

    const response = await api.post('/enquiries', enquiryData)

    alert('✅ Enquiry submitted successfully!')
    onClose()
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.message
    alert(`❌ Failed to submit enquiry: ${errorMsg}`)
  } finally {
    setSubmitting(false)
  }
}


  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-4">Send Inquiry</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Your Name"
            required
            className="input-field"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <input
            type="email"
            placeholder="Email"
            required
            className="input-field"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <input
            type="tel"
            placeholder="Phone"
            required
            className="input-field"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
          <input
            type="text"
            placeholder="Pin Code"
            className="input-field"
            value={formData.pincode}
            onChange={(e) => setFormData({...formData, pincode: e.target.value})}
          />
          <select
            className="input-field"
            value={formData.enquiryType}
            onChange={(e) => setFormData({...formData, enquiryType: e.target.value})}
          >
            <option value="product">Product Inquiry</option>
            <option value="bulk">Bulk Order</option>
            <option value="sample">Sample Request</option>
          </select>
          <textarea
            placeholder="Your Message"
            rows="4"
            required
            className="input-field"
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
          />
          <button
  type="submit"
  disabled={submitting || !product}
  className="btn-primary disabled:opacity-50"
>
  {submitting ? "Submitting..." : "Submit Enquiry"}
</button>  
        </form>
      </div>
    </div>
  )
}
