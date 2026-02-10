import { Link } from 'react-router-dom'
import { MapPin, MessageSquare } from 'lucide-react'

export default function ProductCard({ product }) {
  const slug = product.slug || product.name.toLowerCase().replace(/\s+/g, '-')
  const image = product.images?.[0] || product.image || 'https://via.placeholder.com/400'
  const price = product.price 
    ? `₹${product.price.min} ` 
    : product.priceRange || 'Contact for price'
  const moq = product.moq 
    ? `${product.moq.quantity} ${product.moq.unit}` 
    : product.moqText || 'Contact for MOQ'
  const supplierName = product.supplier?.companyName || product.seller || 'Supplier'
  const location = product.supplier?.address?.city 
    ? `${product.supplier.address.city}, ${product.supplier.address.country || 'India'}` 
    : product.location || 'India'
  
  return (
    <div className="bg-surface-elevated rounded-2xl shadow-soft border border-surface-border overflow-hidden hover:shadow-soft-lg hover:border-primary-200 transition-all duration-200">
      <Link to={`/product/${slug}`} className="block overflow-hidden">
        <img
          src={image}
          alt={product.name}
          className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
        />
      </Link>
      <div className="p-4 sm:p-5">
        <Link to={`/product/${slug}`}>
          <h3 className="font-semibold text-slate-800 mb-2 hover:text-primary line-clamp-2 min-h-[2.5rem] transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="text-primary font-bold text-lg mb-1">{price}</div>
        <div className="text-sm text-slate-600 mb-3">MOQ: {moq}</div>

        {product.attributes && product.attributes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {product.attributes.slice(0, 2).map((attr, idx) => (
              <span key={idx} className="text-xs bg-primary-100 text-primary-700 px-2.5 py-1 rounded-lg font-medium">
                {attr.value || attr}
              </span>
            ))}
          </div>
        )}

        <div className="border-t border-surface-border pt-3 mb-3">
          <div className="text-sm font-medium text-slate-800">{supplierName}</div>
          <div className="text-xs text-slate-500 flex items-center mt-1">
            <MapPin size={12} className="mr-1 flex-shrink-0 text-secondary-500" />
            {location}
          </div>
        </div>

        <Link
          to={`/product/${slug}`}
          className="w-full btn-primary py-2.5 px-4 text-sm flex items-center justify-center gap-2 rounded-xl"
        >
          <MessageSquare size={16} />
          Send Enquiry
        </Link>
      </div>
    </div>
  )
}
