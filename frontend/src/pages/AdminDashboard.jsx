import { useState, useEffect } from 'react'
import { 
  Package, Users, MessageSquare, Eye, Plus, Send, X,
  TrendingUp, TrendingDown, BarChart3, PieChart, 
  Calendar, Filter, Search, ChevronDown, Menu,
  ShoppingCart, DollarSign, Activity, ArrowUpRight,
  ArrowDownRight, MoreVertical, Download, RefreshCw
} from 'lucide-react'
import api from '../api'
import toast from "react-hot-toast"
import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

// Import Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [suppliers, setSuppliers] = useState([])
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [enquiries, setEnquiries] = useState([])
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalEnquiries: 0,
    totalViews: 0,
    totalCategories: 0,
    productsChange: 0,
    enquiriesChange: 0,
    viewsChange: 0,
    categoriesChange: 0
  })
  
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showEditProduct, setShowEditProduct] = useState(false)
  const [showEditCategory, setShowEditCategory] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [editingCategory, setEditingCategory] = useState(null)
  const [newImages, setNewImages] = useState([])
  const [preview, setPreview] = useState([])
  const [newCategoryImage, setNewCategoryImage] = useState(null)
  const [replyTexts, setReplyTexts] = useState({})
  const [sendingReplyId, setSendingReplyId] = useState(null)
  const [loadingCategories, setLoadingCategories] = useState(false)

const [orders, setOrders] = useState([])
const [loadingOrders, setLoadingOrders] = useState(false)

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    category: "",
    priceMin: "",
    priceMax: "",
    moqQuantity: "",
    moqUnit: "Kg",
    images: []
  })

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    icon: '',
    description: ''
  })

  // Fetch all data
  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts()
      fetchCategories()
    }
    if (activeTab === 'categories') {
      fetchCategories()
    }
      if (activeTab === 'orders') {  
    fetchOrders()
  }
    if (activeTab === 'enquiries') {
      fetchEnquiries()
    }
  }, [activeTab])

  const fetchDashboardData = async () => {
    try {
      await Promise.all([
        fetchProducts(),
        fetchEnquiries(),
        fetchCategories()
      ])
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    }
  }

const fetchOrders = async () => {
  try {
    setLoadingOrders(true)
    const res = await api.get('/order/admin/all')
    setOrders(res.data.orders || [])
  } catch (error) {
    console.error('Failed to fetch orders:', error)
    toast.error('Failed to fetch orders')
    setOrders([])
  } finally {
    setLoadingOrders(false)
  }
}










  const fetchEnquiries = async () => {
    try {
      const res = await api.get('/enquiries')
      setEnquiries(res.data.enquiries || [])
      calculateStats(products, res.data.enquiries || [], categories)
    } catch (error) {
      console.error('Failed to fetch enquiries:', error)
      setEnquiries([])
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products')
      setProducts(res.data.products || [])
      calculateStats(res.data.products || [], enquiries, categories)
    } catch (error) {
      console.error('Failed to fetch products:', error)
      setProducts([])
    }
  }

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true)
      const res = await api.get('/categories')
      setCategories(res.data || [])
      calculateStats(products, enquiries, res.data || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      setCategories([])
    } finally {
      setLoadingCategories(false)
    }
  }

  const calculateStats = (prods, enqs, cats) => {
    // Calculate total views from all products
    const totalViews = prods.reduce((sum, p) => sum + (p.views || 0), 0)
    
    // Get new enquiries (last 7 days)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const newEnquiries = enqs.filter(e => new Date(e.createdAt) > weekAgo).length
    
    setStats({
      totalProducts: prods.length,
      totalEnquiries: enqs.length,
      totalViews: totalViews,
      totalCategories: cats.length,
      productsChange: 12, // Mock data - you can calculate real change
      enquiriesChange: newEnquiries > 0 ? Math.round((newEnquiries / enqs.length) * 100) : 0,
      viewsChange: 15, // Mock data
      categoriesChange: 8 // Mock data
    })
  }

  // Chart Data
  const revenueChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Enquiries',
        data: [65, 78, 90, 81, 95, 105, 110, 125, 140, 130, 145, 160],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Products Added',
        data: [28, 35, 42, 38, 50, 55, 60, 65, 70, 75, 80, 85],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }

  const categoryChartData = {
    labels: categories.slice(0, 5).map(c => c.name),
    datasets: [{
      data: categories.slice(0, 5).map(() => Math.floor(Math.random() * 100) + 20),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)'
      ],
      borderWidth: 0
    }]
  }


  const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const res = await api.put(`/order/admin/${orderId}/status`, {
      status: newStatus,
      note: `Status updated to ${newStatus}`
    })
    
    toast.success('Order status updated successfully!')
    fetchOrders() // Refresh orders list
  } catch (error) {
    console.error('Failed to update order status:', error)
    toast.error(error.response?.data?.error || 'Failed to update order status')
  }
} 
  const enquiryStatusData = {
    labels: ['New', 'In Progress', 'Resolved'],
    datasets: [{
      data: [
        enquiries.filter(e => e.status === 'new').length,
        enquiries.filter(e => e.status === 'in-progress').length,
        enquiries.filter(e => e.status === 'resolved').length
      ],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(59, 130, 246, 0.8)'
      ],
      borderWidth: 0
    }]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  }

  // Handlers
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
      if (
        !productForm.name || 
        !productForm.description ||
        !productForm.category ||
        !productForm.priceMin ||
        !productForm.priceMax ||
        !productForm.moqQuantity ||
        !productForm.moqUnit
      ) {
        toast.error("Please fill all required fields")
        return
      }

      if (productForm.images.length === 0) {
        toast.error("Please upload at least one image")
        return
      }

      const slug = productForm.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")

      const productData = {
        name: productForm.name,
        slug,
        description: productForm.description,
        category: productForm.category,
        price: {
          min: Number(productForm.priceMin),
          max: Number(productForm.priceMax),
          currency: 'INR'
        },
        moq: {
          quantity: Number(productForm.moqQuantity),
          unit: productForm.moqUnit
        },
        images: productForm.images
      }

      await api.post("/products", productData)
      toast.success("Product added successfully 🚀")
      
      setProductForm({
        name: "",
        description: "",
        category: "",
        priceMin: "",
        priceMax: "",
        moqQuantity: "",
        moqUnit: "Kg",
        images: []
      })

      fetchProducts()
      setShowAddProduct(false)
    } catch (err) {
      console.error("Add product error:", err)
      toast.error(err.response?.data?.error || "Failed to add product")
    }
  }

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    try {
      await api.delete(`/products/${id}`)
      toast.success('Product deleted successfully!')
      fetchProducts()
    } catch (error) {
      console.error('Failed to delete product:', error)
      toast.error('Failed to delete product.')
    }
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    try {
      if (!categoryForm.name) {
        toast.error("Category name is required")
        return
      }

      if (!newCategoryImage) {
        toast.error("Image is required")
        return
      }

      const formData = new FormData()
      formData.append("category-image", newCategoryImage)

      const uploadRes = await api.post(
        "/upload/category-image",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      )

      const categoryData = {
        name: categoryForm.name,
        slug: categoryForm.slug || categoryForm.name.toLowerCase().replace(/\s+/g, "-"),
        image: uploadRes.data.url,
        description: categoryForm.description,
      }

      await api.post("/categories", categoryData)
      toast.success("✅ Category added successfully!")
      
      setCategoryForm({
        name: '',
        slug: '',
        icon: '',
        description: ''
      })
      setNewCategoryImage(null)
      setShowAddCategory(false)
      fetchCategories()
    } catch (err) {
      console.error("Add category error:", err)
      toast.error(err.response?.data?.error || "Failed to add category")
    }
  }

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return
    try {
      await api.delete(`/categories/${id}`)
      toast.success('Category deleted successfully!')
      fetchCategories()
    } catch (error) {
      console.error('Failed to delete category:', error)
      toast.error('Failed to delete category.')
    }
  }

  const handleEditCategory = async () => {
    try {
      let imageUrl = editingCategory.image

      if (newCategoryImage) {
        const formData = new FormData()
        formData.append("category-image", newCategoryImage)

        const uploadRes = await api.post(
          "/upload/category-image",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        )

        imageUrl = uploadRes.data.url
      }

      const categoryData = {
        name: editingCategory.name,
        slug: editingCategory.slug || editingCategory.name.toLowerCase().replace(/\s+/g, "-"),
        image: imageUrl,
        description: editingCategory.description,
      }

      await api.put(`/categories/${editingCategory._id}`, categoryData)
      toast.success("✅ Category updated successfully!")
      
      setShowEditCategory(false)
      setEditingCategory(null)
      setNewCategoryImage(null)
      fetchCategories()
    } catch (err) {
      console.error("Edit category error:", err)
      toast.error(err.response?.data?.error || "Failed to update category")
    }
  }

  const handleNewImages = (e) => {
    const images = Array.from(e.target.files)
    setNewImages(images)
    const urls = images.map(file => URL.createObjectURL(file))
    setPreview(urls)
  }

  const setReplyText = (enquiryId, value) => {
    setReplyTexts((prev) => ({ ...prev, [enquiryId]: value }))
  }

  const replyToEnquiry = async (enquiryId) => {
    const adminReply = replyTexts[enquiryId]?.trim()
    if (!adminReply) {
      toast.error("Reply message cannot be empty")
      return
    }
    setSendingReplyId(enquiryId)
    try {
      const res = await api.put(`/admin/enquiries/${enquiryId}/reply`, { message: adminReply })
      setEnquiries((prev) => prev.map((enq) => (enq._id === enquiryId ? res.data.enquiry : enq)))
      setReplyTexts((prev) => ({ ...prev, [enquiryId]: "" }))
      toast.success("Reply sent successfully")
    } catch (error) {
      console.error("Failed to reply to enquiry:", error)
      toast.error(error.response?.data?.error || "Failed to send reply")
    } finally {
      setSendingReplyId(null)
    }
  }

  // Navigation items
  const navItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: PieChart },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'enquiries', label: 'Enquiries', icon: MessageSquare }
  ]

  // Stats cards configuration
  const statsCards = [
    { 
      icon: Package, 
      label: 'Total Products', 
      value: stats.totalProducts, 
      change: `+${stats.productsChange}%`,
      positive: true,
      color: 'blue'
    },
    { 
      icon: MessageSquare, 
      label: 'Total Enquiries', 
      value: stats.totalEnquiries, 
      change: `+${stats.enquiriesChange}%`,
      positive: true,
      color: 'green'
    },
    { 
      icon: ShoppingCart,   
      label: 'Total Orders',
      value: orders.length.toLocaleString(),
      change: `+${stats.ordersChange}%`,  
      positive: true,
      color: 'purple'

    },
    { 
      icon: PieChart, 
      label: 'Categories', 
      value: stats.totalCategories, 
      change: `+${stats.categoriesChange}%`,
      positive: true,
      color: 'orange'
    }
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold text-gray-800">Admin</h1>}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <Menu size={20} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={fetchDashboardData}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition"
          >
            <RefreshCw size={20} />
            {sidebarOpen && <span>Refresh</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 capitalize">{activeTab}</h2>
              <p className="text-gray-500 mt-1">Manage your B2B marketplace</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-3 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                <Home size={16} />
              </button>
              </Link>
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((stat, idx) => (
                  <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                        <stat.icon className={`text-${stat.color}-600`} size={24} />
                      </div>
                      <span className={`flex items-center gap-1 text-sm font-medium ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.positive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        {stat.change}
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
                    <div className="text-gray-500 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>

              

              {/* Recent Enquiries */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Enquiries</h3>
                {enquiries.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare size={48} className="mx-auto mb-3 text-gray-300" />
                    <p>No enquiries yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Product</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Customer</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Email</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {enquiries.slice(0, 5).map(enquiry => (
                          <tr key={enquiry._id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 text-sm font-medium text-gray-800">{enquiry.product?.name || 'N/A'}</td>
                            <td className="px-4 py-4 text-sm text-gray-600">{enquiry.name}</td>
                            <td className="px-4 py-4 text-sm text-gray-600">{enquiry.email}</td>
                            <td className="px-4 py-4 text-sm text-gray-600">{new Date(enquiry.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-4">
                              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                enquiry.status === 'new' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-gray-100 text-gray-700'
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

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="text"
                      placeholder="Search products..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Filter size={18} />
                    Filter
                  </button>
                </div>
                <button 
                  onClick={() => setShowAddProduct(!showAddProduct)}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Plus size={20} />
                  {showAddProduct ? 'Cancel' : 'Add Product'}
                </button>
              </div>

              {showAddProduct && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h4 className="font-semibold text-lg mb-4">Add New Product</h4>
                  <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                      <input 
                        type="text" 
                        name="name" 
                        required 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={productForm.name}
                        onChange={handleProductChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                      <select
                        name="category"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={productForm.moqQuantity}
                        onChange={handleProductChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">MOQ Unit *</label>
                      <select 
                        name="moqUnit" 
                        required 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Image *</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files[0]
                          if (!file) return

                          try {
                            const formData = new FormData()
                            formData.append("product-image", file)

                            const res = await api.post(
                              "/upload/product-image",
                              formData,
                              { headers: { "Content-Type": "multipart/form-data" } }
                            )

                            if (res.data && res.data.url) {
                              setProductForm(prev => ({
                                ...prev,
                                images: [...prev.images, res.data.url]
                              }))
                              toast.success("Image uploaded successfully!")
                            } else {
                              throw new Error("Invalid response from server")
                            }
                          } catch (err) {
                            console.error("Image upload failed:", err)
                            toast.error(err.response?.data?.error || "Image upload failed")
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {productForm.images.length > 0 && (
                        <div className="mt-2 flex gap-2">
                          {productForm.images.map((img, i) => (
                            <img key={i} src={img} alt="" className="w-20 h-20 object-cover rounded border" />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                      <textarea 
                        name="description" 
                        required 
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={productForm.description}
                        onChange={handleProductChange}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                        Add Product
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    <Package size={48} className="mx-auto mb-3 text-gray-300" />
                    <p>No products available. Add your first product!</p>
                  </div>
                ) : (
                  products.map(product => (
                    <div key={product._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                      {product.images && product.images[0] && (
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-800 mb-2">{product.name}</h4>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                        <div className="space-y-1 text-sm text-gray-700 mb-4">
                          <div>
                            <span className="font-medium">Price:</span> ₹{product.price?.min} - ₹{product.price?.max}
                          </div>
                          <div>
                            <span className="font-medium">MOQ:</span> {product.moq?.quantity} {product.moq?.unit}
                          </div>
                          <div>
                            <span className="font-medium">Category:</span> {product.category?.name || product.category}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingProduct(product)
                              setShowEditProduct(true)
                            }}
                            className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product._id)}
                            className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Manage Categories</h3>
                <button 
                  onClick={() => setShowAddCategory(!showAddCategory)}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Plus size={20} />
                  {showAddCategory ? 'Cancel' : 'Add Category'}
                </button>
              </div>

              {showAddCategory && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h4 className="font-semibold text-lg mb-4">Add New Category</h4>
                  <form onSubmit={handleAddCategory} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category Name *</label>
                      <input 
                        type="text" 
                        name="name" 
                        required 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={categoryForm.name}
                        onChange={handleCategoryChange}
                        placeholder="e.g., Electronics"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Image *</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setNewCategoryImage(e.target.files[0])}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea 
                        name="description" 
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={categoryForm.description}
                        onChange={handleCategoryChange}
                        placeholder="Brief description of this category"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                        Add Category
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    <PieChart size={48} className="mx-auto mb-3 text-gray-300" />
                    <p>No categories available. Add your first category!</p>
                  </div>
                ) : (
                  categories.map(category => (
                    <div key={category._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                      {category.image && (
                        <img 
                          src={category.image} 
                          alt={category.name}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-800 mb-2">{category.name}</h4>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{category.description}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingCategory(category)
                              setShowEditCategory(true)
                            }}
                            className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteCategory(category._id)}
                            className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {showEditCategory && editingCategory && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
                    <h3 className="text-xl font-bold mb-4">Edit Category</h3>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        handleEditCategory()
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Current Image</label>
                        {editingCategory.image && (
                          <img 
                            src={editingCategory.image} 
                            alt={editingCategory.name}
                            className="w-32 h-32 object-cover rounded-lg border mb-2"
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Change Image</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setNewCategoryImage(e.target.files[0])}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {newCategoryImage && (
                          <p className="text-xs text-green-600 mt-1">
                            ✓ New image selected: {newCategoryImage.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                          rows="3"
                          value={editingCategory.description || ""}
                          onChange={(e) =>
                            setEditingCategory({ ...editingCategory, description: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowEditCategory(false)
                            setEditingCategory(null)
                            setNewCategoryImage(null)
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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



{/* Orders Tab */}
{activeTab === 'orders' && (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-xl font-bold text-gray-800">All Orders</h3>
        <p className="text-sm text-gray-600 mt-1">Total: {orders.length} orders</p>
      </div>
      <div className="flex items-center gap-3">
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          onChange={(e) => {
            if (e.target.value === 'all') {
              fetchOrders()
            } else {
              setOrders(orders.filter(o => o.status === e.target.value))
            }
          }}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button 
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>
    </div>

    {loadingOrders ? (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    ) : orders.length === 0 ? (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <ShoppingCart size={48} className="mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500">No orders yet.</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {orders.map((order) => (
          <div 
            key={order._id} 
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
          >
            {/* Card Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm font-bold text-white">
                  {order.orderNumber}
                </span>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  order.payment?.method === 'cod' 
                    ? 'bg-orange-100 text-orange-700' 
                    : 'bg-white/20 text-white border border-white/30'
                }`}>
                  {order.payment?.method?.toUpperCase() || 'N/A'}
                </span>
              </div>
              <p className="text-white/90 text-sm">
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            {/* Card Body */}
            <div className="p-5">
              {/* Customer Info */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="text-blue-600" size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">
                      {order.user?.name || 'Guest User'}
                    </p>
                    <p className="text-xs text-gray-500">{order.user?.email}</p>
                  </div>
                </div>
                {order.shippingAddress && (
                  <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    <p className="font-medium">{order.shippingAddress.fullName}</p>
                    <p>{order.shippingAddress.addressLine1}</p>
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                    </p>
                    <p className="mt-1">📱 {order.shippingAddress.phone}</p>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  Items ({order.items?.length || 0})
                </p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {order.items?.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                    >
                      {item.productSnapshot?.image && (
                        <img 
                          src={item.productSnapshot.image} 
                          alt={item.productSnapshot?.name}
                          className="w-12 h-12 object-cover rounded border border-gray-200"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {item.productSnapshot?.name || 'Product'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity} × ₹{item.price?.toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-800">
                        ₹{item.subtotal?.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="mb-4 pb-4 border-b border-gray-200 space-y-1 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>₹{order.subtotal?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (18%):</span>
                  <span>₹{order.tax?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping:</span>
                  <span>
                    {order.shippingCost === 0 
                      ? <span className="text-green-600 font-medium">FREE</span> 
                      : `₹${order.shippingCost}`}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t border-gray-200">
                  <span>Total:</span>
                  <span className="text-blue-600">₹{order.total?.toLocaleString()}</span>
                </div>
              </div>

              {/* Status Update */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  Order Status
                </label>
                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                  className={`w-full px-4 py-2.5 text-sm font-medium rounded-lg border-2 cursor-pointer transition focus:ring-2 focus:ring-blue-500 ${
                    order.status === 'delivered' ? 'bg-green-50 border-green-200 text-green-700' :
                    order.status === 'shipped' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                    order.status === 'processing' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                    order.status === 'confirmed' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                    order.status === 'cancelled' ? 'bg-red-50 border-red-200 text-red-700' :
                    'bg-gray-50 border-gray-200 text-gray-700'
                  }`}
                >
                  <option value="pending">⏳ Pending</option>
                  <option value="confirmed">✅ Confirmed</option>
                  <option value="processing">⚙️ Processing</option>
                  <option value="shipped">🚚 Shipped</option>
                  <option value="delivered">📦 Delivered</option>
                  <option value="cancelled">❌ Cancelled</option>
                </select>
              </div>

              {/* Payment Status */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    order.payment?.status === 'completed' ? 'bg-green-500' :
                    order.payment?.status === 'pending' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}></div>
                  <span className="text-xs font-medium text-gray-700">
                    Payment: {order.payment?.status || 'Unknown'}
                  </span>
                </div>
                {order.payment?.paidAt && (
                  <span className="text-xs text-gray-500">
                    {new Date(order.payment.paidAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {/* Card Footer */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                
                {order.tracking?.trackingNumber && (
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Tracking:</span> {order.tracking.trackingNumber}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}


          {/* Enquiries Tab */}
          {activeTab === 'enquiries' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800">All Enquiries</h3>
              {enquiries.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <MessageSquare size={48} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">No enquiries yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {enquiries.map((enquiry) => (
                    <div key={enquiry._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                      <div className="p-5 border-b border-gray-200">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-sm font-semibold text-gray-800">{enquiry.product?.name || 'N/A'}</span>
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            enquiry.status === 'new' ? 'bg-green-100 text-green-700' :
                            enquiry.status === 'responded' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {enquiry.status}
                          </span>
                          <span className="px-2.5 py-1 text-xs rounded-full bg-blue-100 text-blue-700">{enquiry.enquiryType}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{enquiry.message}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                          <span><strong className="text-gray-700">From:</strong> {enquiry.name}</span>
                          <span>{enquiry.email}</span>
                          <span>{enquiry.phone}</span>
                          <span>{new Date(enquiry.createdAt).toLocaleString()}</span>
                        </div>
                        {enquiry.adminResponse?.message && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <p className="text-xs font-medium text-blue-800 mb-1">Your reply</p>
                            <p className="text-sm text-gray-700">{enquiry.adminResponse.message}</p>
                            {enquiry.adminResponse.respondedAt && (
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(enquiry.adminResponse.respondedAt).toLocaleString()}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="p-4 bg-gray-50">
                        <textarea
                          placeholder="Type your reply..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                          rows={2}
                          value={replyTexts[enquiry._id] ?? ''}
                          onChange={(e) => setReplyText(enquiry._id, e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => replyToEnquiry(enquiry._id)}
                          disabled={sendingReplyId === enquiry._id || !(replyTexts[enquiry._id]?.trim())}
                          className="mt-2 w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
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
      </main>

      {/* Edit Product Modal */}
      {showEditProduct && editingProduct && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Edit Product</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                try {
                  let finalImages = [...(editingProduct.images || [])]

                  if (newImages.length > 0) {
                    for (const file of newImages) {
                      const data = new FormData()
                      data.append("product-image", file)

                      const uploadRes = await api.post(
                        "/upload/product-image",
                        data,
                        { headers: { "Content-Type": "multipart/form-data" } }
                      )

                      finalImages.push(uploadRes.data.url)
                    }
                  }

                  const productData = {
                    name: editingProduct.name,
                    slug: editingProduct.slug || editingProduct.name
                      .toLowerCase()
                      .replace(/\s+/g, "-")
                      .replace(/[^\w-]+/g, ""),
                    description: editingProduct.description,
                    category: editingProduct.category?._id || editingProduct.category,
                    price: {
                      min: Number(editingProduct.price?.min),
                      max: Number(editingProduct.price?.max),
                      currency: 'INR'
                    },
                    moq: editingProduct.moq,
                    images: finalImages,
                  }

                  await api.put(`/products/${editingProduct._id}`, productData)
                  toast.success("✅ Product updated successfully!")
                  setShowEditProduct(false)
                  setNewImages([])
                  setPreview([])
                  fetchProducts()
                } catch (err) {
                  console.error("Update error:", err)
                  toast.error(err.response?.data?.error || "Update failed")
                }
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <input
                placeholder="Product Name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={editingProduct.name}
                onChange={e =>
                  setEditingProduct({ ...editingProduct, name: e.target.value })
                }
              />

              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={editingProduct.category?._id || editingProduct.category || ""}
                onChange={e =>
                  setEditingProduct({ ...editingProduct, category: e.target.value })
                }
              >
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Min Price"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={editingProduct.price?.min}
                onChange={e =>
                  setEditingProduct({
                    ...editingProduct,
                    price: { ...editingProduct.price, min: e.target.value },
                  })
                }
              />

              <input
                type="number"
                placeholder="Max Price"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={editingProduct.price?.max}
                onChange={e =>
                  setEditingProduct({
                    ...editingProduct,
                    price: { ...editingProduct.price, max: e.target.value },
                  })
                }
              />

              <input
                type="number"
                placeholder="MOQ Quantity"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={editingProduct.moq?.quantity}
                onChange={e =>
                  setEditingProduct({
                    ...editingProduct,
                    moq: { ...editingProduct.moq, quantity: e.target.value },
                  })
                }
              />

              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={editingProduct.moq?.unit}
                onChange={e =>
                  setEditingProduct({
                    ...editingProduct,
                    moq: { ...editingProduct.moq, unit: e.target.value },
                  })
                }
              >
                <option value="Kg">Kg</option>
                <option value="Pieces">Pieces</option>
                <option value="Liters">Liters</option>
                <option value="Tons">Tons</option>
              </select>

              <textarea
                placeholder="Description"
                className="md:col-span-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={editingProduct.description}
                onChange={e =>
                  setEditingProduct({ ...editingProduct, description: e.target.value })
                }
              />

              <div className="md:col-span-2">
                <p className="font-medium mb-2">Current Images</p>
                <div className="flex gap-3 flex-wrap">
                  {editingProduct.images?.map((img, index) => (
                    <div key={index} className="relative">
                      <img
                        src={img}
                        className="w-20 h-20 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...editingProduct.images]
                          updated.splice(index, 1)
                          setEditingProduct({
                            ...editingProduct,
                            images: updated,
                          })
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <p className="font-medium mt-3 mb-2">Add New Images</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleNewImages(e)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {preview.length > 0 && (
                <div className="md:col-span-2 flex gap-3 flex-wrap">
                  {preview.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      className="w-20 h-20 object-cover rounded border border-blue-400"
                    />
                  ))}
                </div>
              )}

              <div className="md:col-span-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditProduct(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>

    
  )
}