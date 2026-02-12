import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { toast } from "react-hot-toast";

const statusColor = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const res = await api.get("/order/my-orders");
      setOrders(res.data.orders);
    } catch (err) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading your orders...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">My Orders</h2>

      {orders.length === 0 ? (
        <div className="text-gray-500 text-center py-10">
          You haven't placed any orders yet.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white border rounded-xl shadow-sm p-4"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="font-semibold">
                    Order #{order.orderNumber || order._id.slice(-6)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 text-xs rounded-full font-medium ${
                    statusColor[order.status]
                  }`}
                >
                  {order.status}
                </span>
              </div>

              {/* Items */}
              <div className="space-y-3">
                {order.items.slice(0, 2).map((item, index) => (
                  <div key={index} className="flex gap-3 items-center">
                    <img
                      src={item.productSnapshot?.image}
                      className="w-14 h-14 object-cover rounded border"
                    />
                    <div className="text-sm">
                      <p className="font-medium">
                        {item.productSnapshot?.name}
                      </p>
                      <p className="text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}

                {order.items.length > 2 && (
                  <p className="text-xs text-gray-500">
                    +{order.items.length - 2} more items
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center mt-4">
                <div className="font-semibold">
                  ₹{order.total}
                </div>

                <button
                  onClick={() => navigate(`/track-order/${order._id}`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  Track
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyOrders;
