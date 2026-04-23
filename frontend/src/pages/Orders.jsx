import { useEffect, useState } from 'react';
import { Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { orderAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const statusConfig = {
  pending:    { color: 'text-yellow-400 bg-yellow-500/10', icon: Clock },
  confirmed:  { color: 'text-blue-400 bg-blue-500/10',    icon: CheckCircle },
  processing: { color: 'text-orange-400 bg-orange-500/10',icon: Package },
  shipped:    { color: 'text-purple-400 bg-purple-500/10',icon: Truck },
  delivered:  { color: 'text-green-400 bg-green-500/10',  icon: CheckCircle },
  cancelled:  { color: 'text-red-400 bg-red-500/10',      icon: XCircle },
};

export default function Orders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    orderAPI.get('/orders/my-orders')
      .then((r) => setOrders(r.data.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-8">

        <h1 className="text-3xl font-display font-bold mb-8">My Orders</h1>

        {/* USER INFO CARD */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-white">Account Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Name</p>
              <p className="text-white font-medium">{user?.name || 'N/A'}</p>
            </div>

            <div>
              <p className="text-gray-500">Email</p>
              <p className="text-white font-medium">{user?.email || 'N/A'}</p>
            </div>

            <div>
              <p className="text-gray-500">Phone</p>
              <p className="text-white font-medium">{user?.phone || 'Not added'}</p>
            </div>

            <div>
              <p className="text-gray-500">Account Status</p>
              <p className="text-green-400 font-medium">Active</p>
            </div>
          </div>
        </div>

        {/* QUICK STATS */}
        {orders.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="card p-4 text-center">
              <p className="text-gray-500 text-xs">Total Orders</p>
              <p className="text-xl font-bold">{orders.length}</p>
            </div>

            <div className="card p-4 text-center">
              <p className="text-gray-500 text-xs">Delivered</p>
              <p className="text-green-400 font-bold">
                {orders.filter(o => o.status === 'delivered').length}
              </p>
            </div>

            <div className="card p-4 text-center">
              <p className="text-gray-500 text-xs">Pending</p>
              <p className="text-yellow-400 font-bold">
                {orders.filter(o => o.status === 'pending').length}
              </p>
            </div>

            <div className="card p-4 text-center">
              <p className="text-gray-500 text-xs">Cancelled</p>
              <p className="text-red-400 font-bold">
                {orders.filter(o => o.status === 'cancelled').length}
              </p>
            </div>
          </div>
        )}

        {/* ORDERS LIST */}
        {orders.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const cfg  = statusConfig[order.status] || statusConfig.pending;
              const Icon = cfg.icon;

              return (
                <div key={order._id} className="card p-6">

                  {/* HEADER */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 font-mono">
                        #{order._id.slice(-10).toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    <span className={`badge ${cfg.color} flex items-center gap-1`}>
                      <Icon className="w-3 h-3" />
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>

                  {/* ITEMS */}
                  <div className="space-y-2 mb-4">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-400">
                          {item.name} × {item.quantity}
                        </span>
                        <span>
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* FOOTER */}
                  <div className="border-t border-gray-800 pt-4 flex justify-between">
                    <span
                      className={`badge text-xs ${
                        order.paymentStatus === 'paid'
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-yellow-500/10 text-yellow-400'
                      }`}
                    >
                      Payment: {order.paymentStatus}
                    </span>

                    <span className="font-bold text-white">
                      ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                    </span>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
