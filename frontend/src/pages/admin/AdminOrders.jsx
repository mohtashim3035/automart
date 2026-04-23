import { useEffect, useState } from 'react';
import { orderAPI } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.get('/orders')
      .then((r) => setOrders(r.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      const res = await orderAPI.patch(`/orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? res.data.data : o)));
      toast.success('Order status updated!');
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold mb-8">Manage Orders</h1>
        <div className="card p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  {['Order ID', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date'].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-gray-400 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-500">Loading...</td></tr>
                ) : orders.map((order) => (
                  <tr key={order._id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 px-4 text-primary-light font-mono text-xs">{order._id.slice(-8).toUpperCase()}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{order.userName}</div>
                      <div className="text-xs text-gray-500">{order.userEmail}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-400">{order.items.length} item(s)</td>
                    <td className="py-3 px-4 font-semibold">₹{Number(order.totalAmount).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4">
                      <span className={`badge ${order.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-xs text-gray-200 focus:outline-none focus:border-primary"
                      >
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && orders.length === 0 && (
              <div className="text-center py-8 text-gray-500">No orders yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}