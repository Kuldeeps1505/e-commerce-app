import { useState, useEffect } from 'react'
import { Package, Users, MessageSquare, TrendingUp, Eye, Plus } from 'lucide-react'
import api from '../api'




const stats = [
  { icon: Package, label: 'Total Products', value: '1,250', change: '+12%' },
  { icon: Users, label: 'Active Suppliers', value: '342', change: '+8%' },
  { icon: MessageSquare, label: 'New Enquiries', value: '89', change: '+23%' },
  { icon: Eye, label: 'Total Views', value: '45.2K', change: '+15%' }
]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [suppliers, setSuppliers] = useState([])
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [enquiries, setEnquiries] = useState([])
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    description: '',
    priceMin: '',
    priceMax: '',
    moqQuantity: '',
    moqUnit: 'Kg',
    category: '',
    supplier: '',
    images: ''
  })
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    icon: '',
    description: ''
  })


const [loadingCategories, setLoadingCategories] = useState(false);
const [loadingSuppliers, setLoadingSuppliers] = useState(false);


  useEffect(() => {
    if (activeTab === 'suppliers') {
      fetchSuppliers()
    }
    if (activeTab === 'products') {
      fetchProducts()
      fetchCategories()
      fetchSuppliers()
    }
    if (activeTab === 'categories') {
      fetchCategories()
    }
    if (activeTab === 'enquiries') {
      fetchEnquiries()
    }
    if (activeTab === 'overview') {
      // Fetch recent enquiries for overview
      api.get('/enquiries?limit=5')
        .then(res => setEnquiries(res.data.enquiries || []))
        .catch(() => setEnquiries([]))
    }
  }, [activeTab])

  const fetchEnquiries = async () => {
    try {
      const res = await api.get('/enquiries')
      setEnquiries(res.data.enquiries || [])
    } catch (error) {
      console.error('Failed to fetch enquiries:', error)
      setEnquiries([])
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products')
      setProducts(res.data.products || [])
    } catch (error) {
      console.error('Failed to fetch products:', error)
      setProducts([])
    }
  }

  const fetchCategories = async () => {
  try {
    setLoadingCategories(true);
    const res = await api.get('/categories');
    setCategories(res.data || []);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    setCategories([]);
  } finally {
    setLoadingCategories(false);
  }
};

const fetchSuppliers = async () => {
  try {
    setLoadingSuppliers(true);
    const res = await api.get('/suppliers');
    setSuppliers(res.data.suppliers || []);
  } catch (error) {
    console.error('Failed to fetch suppliers:', error);
    setSuppliers([]);
  } finally {
    setLoadingSuppliers(false);
  }
};


  const handleProductChange = (e) => {
    const { name, value } = e.target
    setProductForm(prev => ({ ...prev, [name]: value }))
  }

  const handleCategoryChange = (e) => {
    const { name, value } = e.target
    setCategoryForm(prev => ({ ...prev, [name]: value }))
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    try {
      const productData = {
        name: productForm.name,
        slug: productForm.slug || productForm.name.toLowerCase().replace(/\s+/g, '-'),
        description: productForm.description,
        price: {
          min: parseFloat(productForm.priceMin),
          max: parseFloat(productForm.priceMax),
          currency: 'INR'
        },
        moq: {
          quantity: parseFloat(productForm.moqQuantity),
          unit: productForm.moqUnit
        },
        category: productForm.category,
        supplier: productForm.supplier,
        images: productForm.images.split(',').map(img => img.trim())
      }
      await api.post('/products', productData)
      alert('✅ Product added successfully!')
      setShowAddProduct(false)
      setProductForm({
        name: '',
        description: '',
        priceMin: '',
        priceMax: '',
        moqQuantity: '',
        moqUnit: 'Kg',
        category: '',
        supplier: '',
        images: ''
      })
      fetchProducts()
    } catch (error) {
      console.error('Failed to add product:', error)
      alert(`❌ Failed to add product: ${error.response?.data?.error || error.message}`)
    }
  }

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    try {
      await api.delete(`/products/${id}`)
      alert('✅ Product deleted successfully!')
      fetchProducts()
    } catch (error) {
      console.error('Failed to delete product:', error)
      alert('❌ Failed to delete product.')
    }
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    try {
      const data = {
        name: categoryForm.name,
        slug: categoryForm.slug || categoryForm.name.toLowerCase().replace(/\s+/g, '-'),
        icon: categoryForm.icon,
        description: categoryForm.description
      }
      await api.post('/categories', data)
      alert('✅ Category added successfully!')
      setShowAddCategory(false)
      setCategoryForm({
        name: '',
        icon: '',
        description: ''
      })
      fetchCategories()
    } catch (error) {
      console.error('Failed to add category:', error)
      alert(`❌ Failed to add category: ${error.response?.data?.error || error.message}`)
    }
  }

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return
    try {
      // Note: You may need to add a DELETE endpoint for categories
      alert('❌ Delete category feature coming soon.')
    } catch (error) {
      console.error('Failed to delete category:', error)
      alert('❌ Failed to delete category.')
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-primary text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-blue-100 mt-1">Manage your B2B marketplace</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className="text-primary" size={32} />
                <span className="text-green-600 text-sm font-medium">{stat.change}</span>
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
              <div className="text-gray-600 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b">
            <div className="flex gap-4 px-6">
              {['overview', 'products', 'categories', 'enquiries', 'suppliers'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-4 font-medium capitalize ${
                    activeTab === tab
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-gray-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Enquiries</h3>
                  {enquiries.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-600">No enquiries yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Product</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">User</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {enquiries.map(enquiry => (
                            <tr key={enquiry._id}>
                              <td className="px-4 py-3 text-sm">{enquiry.product?.name || 'N/A'}</td>
                              <td className="px-4 py-3 text-sm">{enquiry.name}</td>
                              <td className="px-4 py-3 text-sm">{enquiry.email}</td>
                              <td className="px-4 py-3 text-sm">{new Date(enquiry.createdAt).toLocaleDateString()}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  enquiry.status === 'new' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {enquiry.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Manage Products</h3>
                  <button 
                    onClick={() => setShowAddProduct(!showAddProduct)}
                    className="btn-primary flex items-center"
                  >
                    <Plus size={18} className="mr-2" />
                    {showAddProduct ? 'Cancel' : 'Add Product'}
                  </button>
                </div>

                {showAddProduct && (
                  <div className="bg-gray-50 p-6 rounded-lg mb-6">
                    <h4 className="font-semibold text-lg mb-4">Add New Product</h4>
                    <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                        <input 
                          type="text" 
                          name="name" 
                          required 
                          className="input-field"
                          value={productForm.name}
                          onChange={handleProductChange}
                        />
                      </div>
                       {/*CATEGORY DROPDOWN */}
                     <div>
                         <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category *
                         </label>
                   <select
                       name="category"
                       required
                       className="input-field"
                       value={productForm.category}
                       onChange={handleProductChange}
                       disabled={loadingCategories}
                     >
                       <option value="">
                       {loadingCategories ? 'Loading categories...' : 'Select Category'}
                     </option>

                   {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>
                    {cat.name}
                   </option>
                    ))}
                 </select>
               </div>
                      
                        
                             <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supplier *
                 </label>

                     <select
                       name="supplier"
                       required
                       className="input-field"
                       value={productForm.supplier}
                       onChange={handleProductChange}
                        disabled={loadingSuppliers}
                      >
                      <option value="">
                         {loadingSuppliers ? 'Loading suppliers...' : 'Select Supplier'}
                     </option>

                    {suppliers.map(supplier => (
                  <option key={supplier._id} value={supplier._id}>
                      {supplier.companyName}
                 </option>
                     ))}
                  </select>
                  </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Min Price (₹) *</label>
                        <input 
                          type="number" 
                          name="priceMin" 
                          required 
                          className="input-field"
                          value={productForm.priceMin}
                          onChange={handleProductChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Max Price (₹) *</label>
                        <input 
                          type="number" 
                          name="priceMax" 
                          required 
                          className="input-field"
                          value={productForm.priceMax}
                          onChange={handleProductChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">MOQ Quantity *</label>
                        <input 
                          type="number" 
                          name="moqQuantity" 
                          required 
                          className="input-field"
                          value={productForm.moqQuantity}
                          onChange={handleProductChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">MOQ Unit *</label>
                        <select 
                          name="moqUnit" 
                          required 
                          className="input-field"
                          value={productForm.moqUnit}
                          onChange={handleProductChange}
                        >
                          <option value="Kg">Kg</option>
                          <option value="Pieces">Pieces</option>
                          <option value="Liters">Liters</option>
                          <option value="Tons">Tons</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                          const formData = new FormData();
                           formData.append('image', e.target.files[0]);

                          const res = await api.post('/upload/product-image', formData, {
                          headers: { 'Content-Type': 'multipart/form-data' }
                          });

                           setProductForm(prev => ({
                               ...prev,
                            images: [...prev.images, res.data.url]
                             }));
                            }}
                        />

                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                        <textarea 
                          name="description" 
                          required 
                          rows="3"
                          className="input-field"
                          value={productForm.description}
                          onChange={handleProductChange}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <button type="submit" className="btn-primary px-6 py-2">
                          Add Product
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.length === 0 ? (
                    <div className="text-gray-500 col-span-full text-center py-8">
                      No products available. Add your first product!
                    </div>
                  ) : (
                    products.map(product => (
                      <div key={product._id} className="border rounded-lg bg-white shadow p-4">
                        {product.images && product.images[0] && (
                          <img 
                            src={product.images[0]} 
                            alt={product.name}
                            className="w-full h-48 object-cover rounded-lg mb-3"
                          />
                        )}
                        <h4 className="font-semibold text-gray-800 mb-2">{product.name}</h4>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                        <div className="text-sm text-gray-700 mb-1">
                          <span className="font-medium">Price:</span> ₹{product.price?.min} - ₹{product.price?.max}
                        </div>
                        <div className="text-sm text-gray-700 mb-1">
                          <span className="font-medium">MOQ:</span> {product.moq?.quantity} {product.moq?.unit}
                        </div>
                        <div className="text-sm text-gray-700 mb-1">
                          <span className="font-medium">Category:</span> {product.category?.name || product.category}
                        </div>
                        <div className="text-sm text-gray-700 mb-3">
                          <span className="font-medium">Supplier:</span> {product.supplier?.companyName || product.supplier}
                        </div>
                        <button 
                          onClick={() => handleDeleteProduct(product._id)}
                          className="w-full bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600"
                        >
                          Delete Product
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'categories' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Manage Categories</h3>
                  <button 
                    onClick={() => setShowAddCategory(!showAddCategory)}
                    className="btn-primary flex items-center"
                  >
                    <Plus size={18} className="mr-2" />
                    {showAddCategory ? 'Cancel' : 'Add Category'}
                  </button>
                </div>

                {showAddCategory && (
                  <div className="bg-gray-50 p-6 rounded-lg mb-6">
                    <h4 className="font-semibold text-lg mb-4">Add New Category</h4>
                    <form onSubmit={handleAddCategory} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category Name *</label>
                        <input 
                          type="text" 
                          name="name" 
                          required 
                          className="input-field"
                          value={categoryForm.name}
                          onChange={handleCategoryChange}
                          placeholder="e.g., Electronics"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Icon (Emoji)</label>
                        <input 
                          type="text" 
                          name="icon" 
                          className="input-field"
                          placeholder="e.g., 💻"
                          value={categoryForm.icon}
                          onChange={handleCategoryChange}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea 
                          name="description" 
                          rows="3"
                          className="input-field"
                          value={categoryForm.description}
                          onChange={handleCategoryChange}
                          placeholder="Brief description of this category"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <button type="submit" className="btn-primary px-6 py-2">
                          Add Category
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full bg-white rounded-lg shadow">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Icon</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {categories.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                            No categories available. Add your first category!
                          </td>
                        </tr>
                      ) : (
                        categories.map(category => (
                          <tr key={category._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-800">
                              {category.icon} {category.name}
                            </td>
                            <td className="px-4 py-3 text-sm">{category.icon}</td>
                            <td className="px-4 py-3 text-sm">
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                              {category.description || '-'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'enquiries' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-6">All Enquiries</h3>
                {enquiries.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">No enquiries yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full bg-white rounded-lg shadow">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Product</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Customer</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Contact</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Message</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {enquiries.map(enquiry => (
                          <tr key={enquiry._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-800">
                              {enquiry.product?.name || 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="font-medium">{enquiry.name}</div>
                              <div className="text-xs text-gray-500">{enquiry.pincode || 'N/A'}</div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="text-xs">{enquiry.email}</div>
                              <div className="text-xs text-gray-500">{enquiry.phone}</div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                {enquiry.enquiryType}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm max-w-xs truncate">
                              {enquiry.message}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(enquiry.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                enquiry.status === 'new' 
                                  ? 'bg-green-100 text-green-800' 
                                  : enquiry.status === 'responded'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {enquiry.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'suppliers' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-6">Supplier Requests</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {suppliers.length === 0 && (
                    <div className="text-gray-500">No supplier requests found.</div>
                  )}
                  {suppliers.map(supplier => (
                    <div key={supplier._id} className="border rounded-lg bg-white shadow p-6 flex flex-col">
                      <h4 className="font-semibold text-primary text-lg mb-2">{supplier.companyName}</h4>
                      <div className="text-sm text-gray-700 mb-2">
                        <span className="font-medium">Contact Person:</span> {supplier.contactPerson}
                      </div>
                      <div className="text-sm text-gray-700 mb-2">
                        <span className="font-medium">Email:</span> {supplier.email}
                      </div>
                      <div className="text-sm text-gray-700 mb-2">
                        <span className="font-medium">Phone:</span> {supplier.phone}
                      </div>
                      <div className="text-sm text-gray-700 mb-2">
                        <span className="font-medium">Business Type:</span> {supplier.businessType}
                      </div>
                      <div className="text-sm text-gray-700 mb-2">
                        <span className="font-medium">Category:</span> {supplier.categoryOption || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-700 mb-2">
                        <span className="font-medium">Product Description:</span> {supplier.productDescription}
                      </div>

                      <div className="text-sm text-gray-700 mb-2">
                        <span className="font-medium">Address:</span>
                        <div>
                          {supplier.address?.street && <span>{supplier.address.street}, </span>}
                          {supplier.address?.city && <span>{supplier.address.city}, </span>}
                          {supplier.address?.state && <span>{supplier.address.state}, </span>}
                          {supplier.address?.country && <span>{supplier.address.country}, </span>}
                          {supplier.address?.pincode && <span>{supplier.address.pincode}</span>}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <button className="btn-secondary px-4 py-2 text-sm">Approve</button>
                        <button className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600">
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

