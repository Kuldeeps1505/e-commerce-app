import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  Mail,
  Search,
  ArrowRight,
  Calendar,
  MapPin,
  ChevronRight
} from "lucide-react";
import api from "../api";
import toast from "react-hot-toast";

export default function TrackOrder() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAllOrders, setLoadingAllOrders] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState(orderNumber || "");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // Fetch specific order by number
  useEffect(() => {
    if (orderNumber) {
      fetchOrder(orderNumber);
    } else {
      setLoading(false);
    }
  }, [orderNumber]);

  // Fetch all user orders if logged in
  useEffect(() => {
    if (isLoggedIn && !orderNumber) {
      fetchAllOrders();
    }
  }, [isLoggedIn]);

  const fetchOrder = async (number) => {
    try {
      setLoading(true);
      const res = await api.get(`/order/track/${number}`);
      setOrder(res.data.order);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Order not found");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllOrders = async () => {
    try {
      setLoadingAllOrders(true);
      const res = await api.get("/order/my-orders?limit=20");
      setAllOrders(res.data.orders || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoadingAllOrders(false);
    }
  };

  

// Handle search submit
const handleSubmit = (e) => {
  e.preventDefault();
  if (!trackingNumber.trim()) {
    toast.error("Please enter an order number");
    return;
  }
  
  // Navigate to track specific order
  navigate(`/track-order/${trackingNumber.trim()}`);
};

// Add filter function for local search in all orders
const filterOrderByNumber = (searchTerm) => {
  if (!searchTerm.trim()) {
    return allOrders;
  }
  
  return allOrders.filter(order => 
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );
};





  const steps = [
    { status: "pending", label: "Placed", icon: Package },
    { status: "confirmed", label: "Confirmed", icon: CheckCircle },
    { status: "processing", label: "Processing", icon: Clock },
    { status: "shipped", label: "Shipped", icon: Truck },
    { status: "delivered", label: "Delivered", icon: CheckCircle },
  ];

  const getStepIndex = (status) => {
    return steps.findIndex((s) => s.status === status);
  };

  const getProgress = (status) => {
    const currentStep = getStepIndex(status);
    return currentStep < 0 ? 0 : (currentStep / (steps.length - 1)) * 100;
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-700 border-green-200";
      case "shipped":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "processing":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "confirmed":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
            <Package className="text-blue-600" size={40} />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Track Your Orders</h1>
          <p className="text-gray-600 text-lg">
            Monitor your order status in real-time
          </p>
        </div>


        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        )}

        

         {/* All Orders Display (if logged in and no specific order) */}
{!orderNumber && isLoggedIn && !loading && (
  <div className="mb-12">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-gray-800">Your Orders</h2>
      <span className="text-sm text-gray-600">
        {allOrders.length} {allOrders.length === 1 ? 'order' : 'orders'}
      </span>
    </div>

    {loadingAllOrders ? (
      <div className="flex justify-center py-12">
        <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    ) : allOrders.length === 0 ? (
      <div className="bg-white p-16 rounded-2xl shadow-lg text-center">
        <Package className="mx-auto text-gray-300 mb-4" size={80} />
        <h3 className="text-xl font-bold text-gray-800 mb-2">No Orders Yet</h3>
        <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
        <Link 
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold"
        >
          Browse Products
          <ArrowRight size={18} />
        </Link>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allOrders.map((orderItem) => {
          const currentStep = getStepIndex(orderItem.status);
          const progress = getProgress(orderItem.status);

          return (
            <div
              key={orderItem._id}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
              onClick={() => navigate(`/track-order/${orderItem.orderNumber}`)}
            >
              {/* Order Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-5 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm font-bold">
                    {orderItem.orderNumber}
                  </span>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(orderItem.status)} bg-white`}>
                    {orderItem.status.toUpperCase()}
                  </div>
                </div>
                <p className="text-sm text-blue-100 flex items-center gap-2">
                  <Calendar size={14} />
                  {formatDate(orderItem.createdAt)}
                </p>
              </div>

              {/* Order Body */}
              <div className="p-5">
                {/* Mini Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-2">
                    <span>Order Progress</span>
                    <span className="font-semibold">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        orderItem.status === "delivered"
                          ? "bg-green-500"
                          : orderItem.status === "cancelled"
                          ? "bg-red-500"
                          : "bg-blue-500"
                      }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Status Steps (Mini) */}
                <div className="grid grid-cols-5 gap-1 mb-4">
                  {steps.map((step, idx) => {
                    const done = idx <= currentStep;
                    const StepIcon = step.icon;
                    return (
                      <div key={step.status} className="text-center">
                        <div
                          className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-1 transition-all ${
                            done
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 text-gray-400"
                          }`}
                        >
                          <StepIcon size={14} />
                        </div>
                        <p className="text-[10px] text-gray-600">{step.label}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Order Summary */}
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Items:</span>
                    <span className="font-semibold">{orderItem.items?.length || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-bold text-blue-600">
                      ₹{orderItem.total?.toLocaleString()}
                    </span>
                  </div>
                  {orderItem.shippingAddress && (
                    <div className="flex items-start gap-2 text-xs text-gray-600 mt-2">
                      <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">
                        {orderItem.shippingAddress.city}, {orderItem.shippingAddress.state}
                      </span>
                    </div>
                  )}
                </div>


  {/* SHIPPING INFO */}
                {orderItem.tracking?.trackingNumber && (
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                  <Truck className="text-blue-600" size={24} />
                  Shipping Information
                </h3>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-600 mb-1">Carrier</p>
                    <p className="font-semibold text-gray-800">{orderItem.tracking.carrier || "N/A"}</p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-600 mb-1">Tracking Number</p>
                    <p className="font-mono font-semibold text-gray-800">{orderItem.tracking.trackingNumber}</p>
                  </div>

                  {orderItem.tracking.estimatedDelivery && (
                    <div className="bg-blue-50 p-4 rounded-xl">
                      <p className="text-xs text-gray-600 mb-1">Estimated Delivery</p>
                      <p className="font-semibold text-gray-800">{formatDate(orderItem .tracking.estimatedDelivery)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
                

               
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
)}


        
        {/* NOT FOUND */}
        {!loading && !order && orderNumber && (
          <div className="bg-white p-16 rounded-2xl shadow-lg text-center max-w-2xl mx-auto">
            <Package className="mx-auto text-gray-300 mb-6" size={100} />
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Order Not Found</h3>
            <p className="text-gray-600 mb-2">
              We couldn't find order: <span className="font-mono font-bold">{orderNumber}</span>
            </p>
            <p className="text-gray-500 text-sm mb-6">Please check the order number and try again.</p>
            <button
              onClick={() => {
                setTrackingNumber("");
                navigate("/track-order");
              }}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}