import { useState, useEffect } from 'react'
import { Package, Users, MessageSquare, TrendingUp, Eye, Plus, Send, CheckCircle, XCircle } from 'lucide-react'
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
    images: []
  })
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    icon: '',
    description: ''
  })


const [loadingCategories, setLoadingCategories] = useState(false);
const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [replyTexts, setReplyTexts] = useState({});
  const [supplierComments, setSupplierComments] = useState({});
  const [sendingReplyId, setSendingReplyId] = useState(null);
  const [updatingSupplierId, setUpdatingSupplierId] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditProduct, setShowEditProduct] = useState(false);
  
  const [showEditCategory, setShowEditCategory] = useState(false);
const [editingCategory, setEditingCategory] = useState(null);



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
        images: productForm.images
      }
      console.log("Images being sent:", productForm.images);
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
        
        images: []
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
      await api.delete(`/categories/${id}`)
      alert('✅ Category deleted successfully!')
      fetchCategories()
    } catch (error) {
      console.error('Failed to delete category:', error)
      alert('❌ Failed to delete category.')
    }
  }


  const handleEditCategory = async () => {
  try {
    const payload = {
      name: editingCategory.name,
      icon: editingCategory.icon,
      description: editingCategory.description
    };

    await api.put(`/categories/${editingCategory._id}`, payload);

    await fetchCategories(); // refresh list

    setShowEditCategory(false);
    setEditingCategory(null);

    alert("✅ Category updated successfully");

  } catch (error) {
    console.error("❌ Category update failed:", error.response?.data || error.message);
    alert("❌ Failed to update category");
  }
};


  const setReplyText = (enquiryId, value) => {
    setReplyTexts((prev) => ({ ...prev, [enquiryId]: value }));
  };

  const replyToEnquiry = async (enquiryId) => {
    const adminReply = replyTexts[enquiryId]?.trim();
    if (!adminReply) {
      alert("Reply message cannot be empty");
      return;
    }
    setSendingReplyId(enquiryId);
    try {
      const res = await api.put(`/admin/enquiries/${enquiryId}/reply`, { message: adminReply });
      setEnquiries((prev) => prev.map((enq) => (enq._id === enquiryId ? res.data.enquiry : enq)));
      setReplyTexts((prev) => ({ ...prev, [enquiryId]: "" }));
      alert("Reply sent successfully");
    } catch (error) {
      console.error("Failed to reply to enquiry:", error);
      alert(error.response?.data?.error || "Failed to send reply");
    } finally {
      setSendingReplyId(null);
    }
  };


  const setSupplierComment = (supplierId, value) => {
    setSupplierComments((prev) => ({ ...prev, [supplierId]: value }));
  };

  const updateSupplierStatus = async (supplierId, status) => {
    if (!["approved", "rejected"].includes(status)) {
      alert("Invalid supplier status");
      return;
    }
    const adminComment = supplierComments[supplierId] ?? "";
    setUpdatingSupplierId(supplierId);
    try {
      const res = await api.put(`/admin/suppliers/${supplierId}`, { status, comment: adminComment });
      setSuppliers((prev) => prev.map((sup) => (sup._id === supplierId ? res.data.supplier : sup)));
      setSupplierComments((prev) => ({ ...prev, [supplierId]: "" }));
      alert(`Supplier ${status} successfully`);
    } catch (error) {
      console.error("Failed to update supplier status:", error);
      alert(error.response?.data?.error || "Failed to update supplier");
    } finally {
      setUpdatingSupplierId(null);
    }
  };


  return (
    <div className="bg-surface min-h-screen">
      <div className="bg-gradient-to-r from-primary-dark via-primary to-primary-500 text-white py-8 sm:py-10 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-primary-100 mt-1">Manage your B2B marketplace</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-surface-elevated rounded-xl shadow-soft border border-surface-border p-5 sm:p-6 hover:shadow-soft-lg hover:border-primary-200 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-primary-100 flex items-center justify-center">
                  <stat.icon className="text-primary" size={24} />
                </div>
                <span className="text-secondary-600 text-xs sm:text-sm font-medium">{stat.change}</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-800 mb-0.5">{stat.value}</div>
              <div className="text-slate-500 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-surface-elevated rounded-2xl shadow-soft border border-surface-border overflow-hidden mb-8">
          <div className="border-b border-surface-border overflow-x-auto">
            <div className="flex gap-1 sm:gap-2 px-4 sm:px-6 min-w-max">
              {['overview', 'products', 'categories', 'enquiries'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-3 sm:px-4 font-medium capitalize text-sm sm:text-base whitespace-nowrap transition-colors ${
                    activeTab === tab
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-slate-500 hover:text-slate-700 hover:text-primary'
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
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await api.post(
        "/upload/product-image",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" }
        }
      );

      // ✅ Store uploaded image URL
      setProductForm(prev => ({
        ...prev,
        images: [...prev.images, res.data.url]
      }));
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("❌ Image upload failed");
    }
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
              

              {showEditProduct && editingProduct && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white w-full max-w-2xl rounded-xl p-6 relative">
      
      <h3 className="text-xl font-bold mb-4">Edit Product</h3>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await api.put(`/products/${editingProduct._id}`, editingProduct);
          setShowEditProduct(false);
          fetchProducts(); // refresh list
        }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <input
          className="input-field"
          value={editingProduct.name}
          onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
        />

        <select
          className="input-field"
          value={editingProduct.category?._id || editingProduct.category}
          onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
        >
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>

        <input
          type="number"
          className="input-field"
          value={editingProduct.price?.min}
          onChange={e => setEditingProduct({
            ...editingProduct,
            price: { ...editingProduct.price, min: e.target.value }
          })}
        />

        <input
          type="number"
          className="input-field"
          value={editingProduct.price?.max}
          onChange={e => setEditingProduct({
            ...editingProduct,
            price: { ...editingProduct.price, max: e.target.value }
          })}
        />

        <textarea
          className="input-field md:col-span-2"
          value={editingProduct.description}
          onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
        />

        <div className="md:col-span-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setShowEditProduct(false)}
            className="px-4 py-2 bg-gray-200 rounded-lg"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
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
                       
                       <div className="flex gap-2 mt-3">
  <button
    onClick={() => {
      setEditingProduct(product);
      setShowEditProduct(true);
    }}
    className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-600 transition"
  >
    Edit
  </button>

  <button 
    onClick={() => handleDeleteProduct(product._id)}
    className="flex-1 bg-red-400 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-500 transition"
  >
    Delete
  </button>
</div>
                       
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

                            <button
  onClick={() => {
    setEditingCategory(category);
    setShowEditCategory(true);
  }}
  className="flex-1 bg-blue-500 text-white px-5 py-3 rounded-lg text-sm hover:bg-blue-600 transition"
>
  Edit
</button> 
                         
                         
                          <button 
                          onClick={() => handleDeleteCategory(category._id)}
                          className="flex-1 bg-red-400 text-white px-5 py-3 rounded-lg text-sm hover:bg-red-500 transition"
                        >
                          Delete Category
                        </button>
                      
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {showEditCategory && editingCategory && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
      <h3 className="text-xl font-bold mb-4">Edit Category</h3>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleEditCategory();
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Category Name *</label>
          <input
            type="text"
            value={editingCategory.name}
            onChange={(e) =>
              setEditingCategory({ ...editingCategory, name: e.target.value })
            }
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Icon</label>
          <input
            type="text"
            value={editingCategory.icon || ""}
            onChange={(e) =>
              setEditingCategory({ ...editingCategory, icon: e.target.value })
            }
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            rows="3"
            value={editingCategory.description || ""}
            onChange={(e) =>
              setEditingCategory({ ...editingCategory, description: e.target.value })
            }
            className="input-field"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setShowEditCategory(false);
              setEditingCategory(null);
            }}
            className="px-4 py-2 border rounded-lg"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="btn-primary px-5 py-2"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
)}

              </div>
            )}
            

            {activeTab === 'enquiries' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-6">All Enquiries</h3>
                {enquiries.length === 0 ? (
                  <div className="text-center py-12 bg-surface-muted rounded-xl border-2 border-dashed border-surface-border">
                    <MessageSquare className="w-12 h-12 mx-auto text-primary-300 mb-3" />
                    <p className="text-slate-500">No enquiries yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {enquiries.map((enquiry) => (
                      <div key={enquiry._id} className="bg-surface-elevated rounded-xl border border-surface-border shadow-soft overflow-hidden hover:shadow-soft-lg hover:border-primary-200 transition-all">
                        <div className="p-5 border-b border-surface-border">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="text-sm font-semibold text-gray-800">{enquiry.product?.name || 'N/A'}</span>
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                              enquiry.status === 'new' ? 'bg-emerald-100 text-emerald-800' :
                              enquiry.status === 'responded' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {enquiry.status}
                            </span>
                            <span className="px-2.5 py-1 text-xs rounded-full bg-blue-100 text-blue-800">{enquiry.enquiryType}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{enquiry.message}</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                            <span><strong className="text-gray-700">From:</strong> {enquiry.name}</span>
                            <span>{enquiry.email}</span>
                            <span>{enquiry.phone}</span>
                            <span>{new Date(enquiry.createdAt).toLocaleString()}</span>
                          </div>
                          {enquiry.adminResponse?.message && (
                            <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                              <p className="text-xs font-medium text-amber-800 mb-1">Your reply</p>
                              <p className="text-sm text-gray-700">{enquiry.adminResponse.message}</p>
                              {enquiry.adminResponse.respondedAt && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(enquiry.adminResponse.respondedAt).toLocaleString()}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="p-4 bg-primary-50/50">
                          <textarea
                            placeholder="Type your reply..."
                            className="input-field text-sm resize-none"
                            rows={2}
                            value={replyTexts[enquiry._id] ?? ''}
                            onChange={(e) => setReplyText(enquiry._id, e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => replyToEnquiry(enquiry._id)}
                            disabled={sendingReplyId === enquiry._id || !(replyTexts[enquiry._id]?.trim())}
                            className="mt-2 w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Send size={16} />
                            {sendingReplyId === enquiry._id ? 'Sending...' : 'Send Reply'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

