import { useEffect, useState, useContext } from "react";
import { UserCircle, MessageSquare ,  LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion"


const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}
export default function Profile() {

const [enquiries, setEnquiries] = useState([])
const [loading, setLoading] = useState(true);

const totalEnquiries = enquiries.length
const replied = enquiries.filter(e => e.adminResponse?.message).length 




  // ✅ ALL HOOKS AT TOP (NO EXCEPTIONS)
  const navigate = useNavigate();
  const { user: authUser, setUser, logout } = useContext(AuthContext);

  


  // ✅ DATA FETCH
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile/me");
        setUser(res.data.user);          // sync auth context
        
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [setUser]);

 
  useEffect(() => {
  const fetchEnquiries = async () => {
    try {
      const res = await api.get("/enquiries");

      // ✅ FIX HERE
      setEnquiries(res.data.enquiries || []);
      // OR if your backend sends { data: [...] }
      // setEnquiries(res.data.data || []);

    } catch (err) {
      console.error("Enquiry fetch failed", err);
      setEnquiries([]); // safety
    }
  };

  fetchEnquiries();
}, []);


  // ✅ LOGOUT HANDLER
  const handleLogout = () => {
    logout(); // clears context + localStorage
    window.dispatchEvent(new Event("auth-change"));
    navigate("/login");
  };

  // ✅ SAFE RETURNS (AFTER ALL HOOKS)
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-slate-500">Loading profile...</p>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Unable to load profile.</p>
      </div>
    );
  }

  // ✅ MAIN UI
  return (
     <div className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
      >
        <div className="max-w-6xl mx-auto px-6 py-10">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-blue-100 mt-1">
            Manage your account & enquiries
          </p>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">

        {/* PROFILE CARD */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-6"
        >
          <UserCircle className="w-20 h-20 text-blue-600" />

          <div className="flex-1">
            <p className="text-xl font-semibold text-slate-800">
              {authUser.name}
            </p>
            <p className="text-slate-500">{authUser.email}</p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </motion.section>

        {/* STATS */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          <div className="bg-white p-5 rounded-xl border">
            <p className="text-sm text-slate-500">Total Enquiries</p>
            <p className="text-2xl font-bold">{totalEnquiries}</p>
          </div>

          <div className="bg-white p-5 rounded-xl border">
            <p className="text-sm text-slate-500">Replied</p>
            <p className="text-2xl font-bold text-green-600">{replied}</p>
          </div>

          <div className="bg-white p-5 rounded-xl border">
            <p className="text-sm text-slate-500">Pending</p>
            <p className="text-2xl font-bold text-orange-500">
              {totalEnquiries - replied}
            </p>
          </div>
        </motion.section>

        {/* ENQUIRIES */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border shadow-sm p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="w-7 h-7 text-blue-600" />
            <h2 className="text-xl font-semibold">My Enquiries</h2>
          </div>

          {enquiries.length === 0 ? (
            <p className="text-slate-500">You haven’t made any enquiries yet.</p>
          ) : (
            <div className="space-y-5">
              {enquiries.map(enq => (
                <motion.div
                  key={enq._id}
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 220 }}
                  className="border rounded-xl p-5 bg-slate-50 hover:bg-white hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-slate-800">
                      {enq.product?.name}
                    </p>

                    <span
                      className={`text-xs px-3 py-1 rounded-full ${
                        enq.adminResponse?.message
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {enq.adminResponse?.message ? "Replied" : "Pending"}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 mt-2">
                    {enq.message}
                  </p>

                  {enq.adminResponse?.message && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-semibold text-green-700 mb-1">
                        Admin Reply
                      </p>
                      <p className="text-sm text-green-800">
                        {enq.adminResponse.message}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

      </div>
    </div>
  )
}