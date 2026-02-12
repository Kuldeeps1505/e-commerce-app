import { useEffect, useState } from "react"
import {
  MessageSquare,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  Calendar,
  Package,
  User,
  Mail,
  Phone,
  ExternalLink
} from "lucide-react"
import { Link } from "react-router-dom"
import api from "../api"
import { motion, AnimatePresence } from "framer-motion"

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function Messages() {
  const [enquiries, setEnquiries] = useState([])
  const [filteredEnquiries, setFilteredEnquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all") // all, pending, replied
  const [sortBy, setSortBy] = useState("recent") // recent, oldest
  const [expandedEnquiry, setExpandedEnquiry] = useState(null)

  // Fetch Enquiries
  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const res = await api.get("/enquiries")
        const data = res.data.enquiries || []
        setEnquiries(data)
        setFilteredEnquiries(data)
      } catch (err) {
        console.error("Failed to fetch enquiries", err)
      } finally {
        setLoading(false)
      }
    }

    fetchEnquiries()
  }, [])

  // Filter and Search
  useEffect(() => {
    let result = [...enquiries]

    // Filter by status
    if (filterStatus === "pending") {
      result = result.filter(e => !e.adminResponse?.message)
    } else if (filterStatus === "replied") {
      result = result.filter(e => e.adminResponse?.message)
    }

    // Search
    if (searchQuery.trim()) {
      result = result.filter(e =>
        e.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.message?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort
    if (sortBy === "recent") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    }

    setFilteredEnquiries(result)
  }, [enquiries, filterStatus, searchQuery, sortBy])

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get time ago
  const getTimeAgo = (dateString) => {
    if (!dateString) return ""
    const now = new Date()
    const past = new Date(dateString)
    const diffMs = now - past
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return formatDate(dateString)
  }

  // Stats
  const stats = {
    total: enquiries.length,
    pending: enquiries.filter(e => !e.adminResponse?.message).length,
    replied: enquiries.filter(e => e.adminResponse?.message).length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading your messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary via-primary-dark to-blue-900 text-white"
      >
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black">Messages & Enquiries</h1>
              <p className="text-blue-100 text-lg mt-1">
                Track and manage all your product enquiries
              </p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-3xl font-black">{stats.total}</p>
              <p className="text-blue-100 text-sm font-medium">Total Enquiries</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-3xl font-black text-orange-300">{stats.pending}</p>
              <p className="text-blue-100 text-sm font-medium">Pending</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-3xl font-black text-green-300">{stats.replied}</p>
              <p className="text-blue-100 text-sm font-medium">Replied</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Filters & Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by product name or message..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter by Status */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  filterStatus === "all"
                    ? "bg-primary text-white shadow-lg"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setFilterStatus("pending")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  filterStatus === "pending"
                    ? "bg-orange-500 text-white shadow-lg"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Pending ({stats.pending})
              </button>
              <button
                onClick={() => setFilterStatus("replied")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  filterStatus === "replied"
                    ? "bg-green-500 text-white shadow-lg"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Replied ({stats.replied})
              </button>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-slate-200 rounded-xl bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="recent">Recent First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </motion.div>

        {/* Enquiries List */}
        {filteredEnquiries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center"
          >
            <MessageSquare className="w-20 h-20 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">No enquiries found</h3>
            <p className="text-slate-500">
              {searchQuery || filterStatus !== "all"
                ? "Try adjusting your filters or search query"
                : "You haven't made any enquiries yet. Start exploring products!"}
            </p>
            {!searchQuery && filterStatus === "all" && (
              <Link
                to="/products"
                className="inline-block mt-6 px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors"
              >
                Browse Products
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredEnquiries.map((enquiry, index) => (
                <motion.div
                  key={enquiry._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Enquiry Header */}
                  <div
                    className="p-6 cursor-pointer"
                    onClick={() => setExpandedEnquiry(expandedEnquiry === enquiry._id ? null : enquiry._id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          {/* Product Image */}
                          {enquiry.product?.image && (
                            <img
                              src={enquiry.product.image}
                              alt={enquiry.product.name}
                              className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                            />
                          )}
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-bold text-lg text-slate-800">
                                  {enquiry.product?.name || "Product Enquiry"}
                                </h3>
                                <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                                  <Calendar size={14} />
                                  {getTimeAgo(enquiry.createdAt)}
                                </p>
                              </div>
                              
                              {/* Status Badge */}
                              <div className="flex items-center gap-2">
                                {enquiry.adminResponse?.message ? (
                                  <span className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full font-semibold text-sm">
                                    <CheckCircle size={16} />
                                    Replied
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full font-semibold text-sm">
                                    <Clock size={16} />
                                    Pending
                                  </span>
                                )}
                                <ChevronDown
                                  className={`w-5 h-5 text-slate-400 transition-transform ${
                                    expandedEnquiry === enquiry._id ? "rotate-180" : ""
                                  }`}
                                />
                              </div>
                            </div>

                            {/* Message Preview */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                              <p className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                                <MessageSquare size={14} />
                                Your Message:
                              </p>
                              <p className={`text-slate-600 ${expandedEnquiry !== enquiry._id ? 'line-clamp-2' : ''}`}>
                                {enquiry.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {expandedEnquiry === enquiry._id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-slate-200 bg-slate-50"
                      >
                        <div className="p-6 space-y-4">
                          
                          {/* Admin Response */}
                          {enquiry.adminResponse?.message ? (
                            <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-5">
                              <p className="font-bold text-green-800 mb-3 flex items-center gap-2">
                                <CheckCircle size={18} />
                                Admin Reply:
                              </p>
                              <p className="text-green-900 leading-relaxed">
                                {enquiry.adminResponse.message}
                              </p>
                              {enquiry.adminResponse.repliedAt && (
                                <p className="text-xs text-green-700 mt-3 flex items-center gap-1">
                                  <Calendar size={12} />
                                  Replied on {formatDate(enquiry.adminResponse.repliedAt)}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="bg-orange-50 border-l-4 border-orange-500 rounded-xl p-5">
                              <p className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                                <AlertCircle size={18} />
                                Awaiting Response
                              </p>
                              <p className="text-orange-700 text-sm">
                                We're reviewing your enquiry and will respond shortly.
                              </p>
                            </div>
                          )}

                          {/* Contact Details */}
                          {enquiry.contactInfo && (
                            <div className="grid md:grid-cols-2 gap-4">
                              {enquiry.contactInfo.name && (
                                <div className="flex items-center gap-3 bg-white rounded-xl p-4 border border-slate-200">
                                  <User size={18} className="text-slate-500" />
                                  <div>
                                    <p className="text-xs text-slate-500 font-medium">Name</p>
                                    <p className="text-sm font-semibold text-slate-800">{enquiry.contactInfo.name}</p>
                                  </div>
                                </div>
                              )}
                              {enquiry.contactInfo.email && (
                                <div className="flex items-center gap-3 bg-white rounded-xl p-4 border border-slate-200">
                                  <Mail size={18} className="text-slate-500" />
                                  <div>
                                    <p className="text-xs text-slate-500 font-medium">Email</p>
                                    <p className="text-sm font-semibold text-slate-800">{enquiry.contactInfo.email}</p>
                                  </div>
                                </div>
                              )}
                              {enquiry.contactInfo.phone && (
                                <div className="flex items-center gap-3 bg-white rounded-xl p-4 border border-slate-200">
                                  <Phone size={18} className="text-slate-500" />
                                  <div>
                                    <p className="text-xs text-slate-500 font-medium">Phone</p>
                                    <p className="text-sm font-semibold text-slate-800">{enquiry.contactInfo.phone}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* View Product Link */}
                          {enquiry.product && (
                            <Link
                              to={`/product/${enquiry.product.slug || enquiry.product._id}`}
                              className="flex items-center justify-center gap-2 w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold transition-colors"
                            >
                              <Package size={18} />
                              View Product Details
                              <ExternalLink size={16} />
                            </Link>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}