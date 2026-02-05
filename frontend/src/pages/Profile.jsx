import { useEffect, useState, useContext } from "react";
import { UserCircle, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { AuthContext } from "../context/AuthContext";

export default function Profile() {

  // ✅ ALL HOOKS AT TOP (NO EXCEPTIONS)
  const navigate = useNavigate();
  const { user: authUser, setUser, logout } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [enquiries, setEnquiries] = useState([]);

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
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">

      <h1 className="text-3xl font-bold text-slate-800">My Profile</h1>

      {/* BASIC INFO */}
      <section className="bg-white rounded-xl border p-6">
        <div className="flex items-center gap-3 mb-4">
          <UserCircle className="w-8 h-8 text-blue-600" />
          <h2 className="text-lg font-semibold">Basic Info</h2>
        </div>

        <p><strong>Name:</strong> {authUser.name}</p>
        <p><strong>Email:</strong> {authUser.email}</p>
      </section>

      {/* ENQUIRIES */}
      <section className="bg-white rounded-xl border p-6">
        <div className="flex items-center gap-3 mb-4">
          <MessageSquare className="w-7 h-7 text-blue-600" />
          <h2 className="text-lg font-semibold">My Enquiries</h2>
        </div>

        {enquiries.length === 0 ? (
          <p className="text-slate-500">No enquiries yet.</p>
        ) : (
          <div className="space-y-4">
            {enquiries.map(enq => (
              <div key={enq._id} className="border rounded-lg p-4">
                <p className="font-medium">{enq.product?.name}</p>
                <p className="text-sm text-slate-600">{enq.message}</p>

                {enq.adminResponse?.message && (
                  <div className="mt-3 p-3 bg-green-50 border rounded">
                    <p className="text-sm font-medium text-green-700">
                      Admin reply:
                    </p>
                    <p className="text-sm">{enq.adminResponse.message}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* LOGOUT */}
      <div className="flex justify-end">
        <button
          onClick={handleLogout}
          className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
