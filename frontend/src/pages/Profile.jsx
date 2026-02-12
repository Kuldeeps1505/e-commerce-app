import { useEffect, useState, useContext } from "react"
import { 
  UserCircle, 
  MessageSquare, 
  LogOut, 
  Mail, 
  Calendar, 
  Shield,
  MapPin,
  Phone,
  Edit,
  Package,
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Building
} from "lucide-react"
import { useNavigate, Link } from "react-router-dom"
import api from "../api"
import { AuthContext } from "../context/AuthContext"
import { motion } from "framer-motion"

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function Profile() {
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEnquiries: 0,
    replied: 0,
    pending: 0,
    totalOrders: 0
  })

 


  const navigate = useNavigate()
  const { user: authUser, setUser, logout } = useContext(AuthContext)
 const [showEditModal, setShowEditModal] = useState(false);
const [newName, setNewName] = useState(authUser?.name || "");
const [updating, setUpdating] = useState(false);


  // Fetch Profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile/me")
        setUser(res.data.user)
      } catch (error) {
        console.error("Failed to load profile", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [setUser])


useEffect(() => {
  if (authUser?.name) setNewName(authUser.name);
}, [authUser]);






  // Fetch Enquiries
  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const res = await api.get("/enquiries")
        const enquiriesData = res.data.enquiries || []
        setEnquiries(enquiriesData)
        
        // Calculate stats
        const totalEnquiries = enquiriesData.length
        const replied = enquiriesData.filter(e => e.adminResponse?.message).length
        setStats({
          totalEnquiries,
          replied,
          pending: totalEnquiries - replied,
          totalOrders: 0 // TODO: Fetch from orders API
        })
      } catch (err) {
        console.error("Enquiry fetch failed", err)
        setEnquiries([])
      }
    }

    fetchEnquiries()
  }, [])

  // Logout Handler
  const handleLogout = () => {
    logout()
    window.dispatchEvent(new Event("auth-change"))
    navigate("/login")
  }


  const handleUpdateName = async () => {
  try {
    setUpdating(true);

    const res = await api.put("/auth/update-name", {
      name: newName,
    });

    // update global auth user
    setUser(res.data.user);

    setShowEditModal(false);
  } catch (err) {
    console.error("Update failed", err);
  } finally {
    setUpdating(false);
  }
};


  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!authUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 text-lg">Unable to load profile.</p>
          <Link to="/login" className="text-primary hover:underline mt-2 inline-block">
            Please login again
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary via-primary-dark to-blue-900 text-white relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-black mb-2">My Account</h1>
          <p className="text-blue-100 text-lg">
            Manage your profile, enquiries, and business activities
          </p>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Profile Info Card */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.4 }}
              className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
            >
              {/* Profile Header */}
              <div className="bg-gradient-to-br from-primary to-primary-dark p-6 text-white">
                <div className="flex justify-center mb-4">
                  <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30">
                    <UserCircle className="w-16 h-16 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-center">{authUser.name}</h2>
                <p className="text-blue-100 text-center text-sm mt-1">
                  {authUser.role === 'supplier' ? '🏢 Supplier' : authUser.role === 'buyer' ? '🛒 Buyer' : '👤 User'}
                </p>
              </div>

              {/* Profile Details */}
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 font-medium">Email</p>
                    <p className="text-sm text-slate-800 break-all">{authUser.email}</p>
                  </div>
                </div>

                {authUser.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 font-medium">Phone</p>
                      <p className="text-sm text-slate-800">{authUser.phone}</p>
                    </div>
                  </div>
                )}

                {authUser.company && (
                  <div className="flex items-start gap-3">
                    <Building className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 font-medium">Company</p>
                      <p className="text-sm text-slate-800">{authUser.company}</p>
                    </div>
                  </div>
                )}

                {authUser.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 font-medium">Location</p>
                      <p className="text-sm text-slate-800">{authUser.location}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 font-medium">Member Since</p>
                    <p className="text-sm text-slate-800">{formatDate(authUser.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 font-medium">Account Status</p>
                    <span className="inline-flex items-center gap-1 text-sm text-green-700 bg-green-100 px-2 py-1 rounded-full mt-1">
                      <CheckCircle size={14} />
                      Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 space-y-2">
              
            
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors font-medium"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1, duration: 0.4 }}
              className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6"
            >
              <h3 className="font-bold text-slate-800 mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link
                  to="/messages"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-primary-50 rounded-xl transition-colors group"
                >
                  <MessageSquare className="w-5 h-5 text-slate-600 group-hover:text-primary" />
                  <span className="text-sm font-medium text-slate-700 group-hover:text-primary">Messages & Enquiries</span>
                  {stats.pending > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      {stats.pending}
                    </span>
                  )}
                </Link>
                <Link
                  to="/track-order/:orderId"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-primary-50 rounded-xl transition-colors group"
                >
                  <ShoppingBag className="w-5 h-5 text-slate-600 group-hover:text-primary" />
                  <span className="text-sm font-medium text-slate-700 group-hover:text-primary">My Orders</span>
                </Link>
                {authUser.role === 'supplier' && (
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-primary-50 rounded-xl transition-colors group"
                  >
                    <Package className="w-5 h-5 text-slate-600 group-hover:text-primary" />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-primary">My Products</span>
                  </Link>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Stats & Activity */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Statistics Cards */}
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 lg:grid-cols-3 gap-4"
            >
              <motion.div
                variants={fadeUp}
                className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-3xl font-black text-slate-800">{stats.totalEnquiries}</p>
                <p className="text-sm text-slate-500 font-medium">Total Enquiries</p>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <p className="text-3xl font-black text-green-600">{stats.replied}</p>
                <p className="text-sm text-slate-500 font-medium">Replied</p>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <p className="text-3xl font-black text-orange-600">{stats.pending}</p>
                <p className="text-sm text-slate-500 font-medium">Pending</p>
              </motion.div>
            </motion.div>

            {/* Recent Enquiries Preview */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2, duration: 0.4 }}
              className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-7 h-7 text-primary" />
                  <h2 className="text-xl font-bold text-slate-800">Recent Enquiries</h2>
                </div>
                <Link
                  to="/messages"
                  className="text-primary hover:text-primary-dark font-semibold text-sm flex items-center gap-1 group"
                >
                  View All
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>

              {enquiries.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">No enquiries yet</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Your enquiries will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {enquiries.slice(0, 3).map((enq) => (
                    <motion.div
                      key={enq._id}
                      whileHover={{ y: -2, scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="border border-slate-200 rounded-xl p-4 bg-slate-50 hover:bg-white hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800 line-clamp-1">
                            {enq.product?.name || "Product Enquiry"}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {formatDate(enq.createdAt)}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-semibold ${
                            enq.adminResponse?.message
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {enq.adminResponse?.message ? "✓ Replied" : "⏳ Pending"}
                        </span>
                      </div>

                      <p className="text-sm text-slate-600 line-clamp-2">
                        {enq.message}
                      </p>

                      {enq.adminResponse?.message && (
                        <div className="mt-3 p-3 bg-green-50 border-l-4 border-green-500 rounded">
                          <p className="text-xs font-semibold text-green-700 mb-1">
                            Admin Reply:
                          </p>
                          <p className="text-sm text-green-800 line-clamp-2">
                            {enq.adminResponse.message}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {enquiries.length > 3 && (
                    <Link
                      to="/messages"
                      className="block text-center py-3 text-primary hover:text-primary-dark font-semibold text-sm border-2 border-dashed border-primary rounded-xl hover:bg-primary-50 transition-colors"
                    >
                      View {enquiries.length - 3} more enquiries
                    </Link>
                  )}
                </div>
              )}
            </motion.div>

            {/* Activity Timeline */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3, duration: 0.4 }}
              className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6"
            >
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">Account created</p>
                    <p className="text-xs text-slate-500">{formatDate(authUser.createdAt)}</p>
                  </div>
                </div>
                {enquiries.length > 0 && (
                  <div className="flex gap-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700">Latest enquiry sent</p>
                      <p className="text-xs text-slate-500">{formatDate(enquiries[0]?.createdAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {showEditModal && (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
      <h2 className="text-xl font-bold mb-4">Edit Name</h2>

      <input
        type="text"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
      />

      <div className="flex justify-end gap-2">
        <button
          onClick={() => setShowEditModal(false)}
          className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200"
        >
          Cancel
        </button>

        <button
          onClick={handleUpdateName}
          disabled={updating}
          className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {updating ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  )
}