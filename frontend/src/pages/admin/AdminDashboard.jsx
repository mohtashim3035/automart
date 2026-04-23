import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, ShoppingBag, Users, DollarSign,
  TrendingUp, ClipboardList, AlertCircle,
  Warehouse, AlertTriangle
} from 'lucide-react';
import { productAPI, orderAPI, userAPI, listingAPI, inventoryAPI } from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0, orders: 0, users: 0,
    revenue: 0, pendingListings: 0, lowStock: 0,
  });
  const [recentOrders,    setRecentOrders]    = useState([]);
  const [pendingListings, setPendingListings] = useState([]);
  const [loading,         setLoading]         = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [pRes, oRes, uRes, lRes, lowRes] = await Promise.all([
          productAPI.get('/products?limit=1'),
          orderAPI.get('/orders'),
          userAPI.get('/users'),
          listingAPI.get('/listings?status=pending'),
          inventoryAPI.get('/inventory/low-stock'),
        ]);

        const orders  = oRes.data.data || [];
        const revenue = orders
          .filter((o) => o.paymentStatus === 'paid')
          .reduce((s, o) => s + o.totalAmount, 0);

        setStats({
          products:        pRes.data.total    || 0,
          orders:          orders.length,
          users:           uRes.data.total    || 0,
          revenue,
          pendingListings: lRes.data.total    || 0,
          lowStock:        (lowRes.data.data  || []).length,
        });
        setRecentOrders(orders.slice(0, 5));
        setPendingListings((lRes.data.data || []).slice(0, 3));
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const statCards = [
    { label: 'Total Products',   value: stats.products,                                      icon: Package,      color: 'text-blue-400',   bg: 'bg-blue-500/10',   href: '/admin/products' },
    { label: 'Total Orders',     value: stats.orders,                                         icon: ShoppingBag,  color: 'text-green-400',  bg: 'bg-green-500/10',  href: '/admin/orders' },
    { label: 'Total Users',      value: stats.users,                                          icon: Users,        color: 'text-purple-400', bg: 'bg-purple-500/10', href: '/admin/users' },
    { label: 'Revenue (paid)',   value: `₹${Number(stats.revenue).toLocaleString('en-IN')}`,  icon: DollarSign,   color: 'text-yellow-400', bg: 'bg-yellow-500/10', href: '/admin/orders' },
    { label: 'Pending Listings', value: stats.pendingListings,                                icon: ClipboardList,color: 'text-orange-400', bg: 'bg-orange-500/10', href: '/admin/listings' },
    { label: 'Low Stock Items',  value: stats.lowStock,                                       icon: AlertTriangle,color: 'text-red-400',    bg: 'bg-red-500/10',    href: '/admin/inventory' },
  ];

  return (
    <div className="min-h-screen pt-20 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-8">

        
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">Admin Dashboard</h1>
            <p className="text-gray-400 mt-1">Manage your AutoMart platform</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/listings"  className="btn-primary py-2 px-3 text-sm flex items-center gap-1.5"><ClipboardList className="w-4 h-4" /> Listings</Link>
            <Link to="/admin/inventory" className="btn-secondary py-2 px-3 text-sm flex items-center gap-1.5"><Warehouse className="w-4 h-4" /> Inventory</Link>
            <Link to="/admin/products"  className="btn-secondary py-2 px-3 text-sm">Products</Link>
            <Link to="/admin/orders"    className="btn-secondary py-2 px-3 text-sm">Orders</Link>
            <Link to="/admin/users"     className="btn-secondary py-2 px-3 text-sm">Users</Link>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          {statCards.map(({ label, value, icon: Icon, color, bg, href }) => (
            <Link key={label} to={href} className="card p-5 hover:border-primary/50 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-2xl font-bold font-display">{loading ? '—' : value}</div>
              <div className="text-xs text-gray-400 mt-1 leading-tight">{label}</div>
            </Link>
          ))}
        </div>

        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        
          <div className="card p-6">
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-400" /> Needs Review
            </h2>
            {!loading && pendingListings.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No pending listings</p>
            ) : (
              <div className="space-y-3">
                {pendingListings.map((l) => (
                  <div key={l._id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl">
                    <div className="w-12 h-9 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
                      {l.images?.[0]
                        ? <img src={l.images[0]} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><Package className="w-4 h-4 text-gray-600" /></div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{l.name}</p>
                      <p className="text-xs text-gray-500">{l.sellerName}</p>
                    </div>
                  </div>
                ))}
                {stats.pendingListings > 3 && (
                  <p className="text-xs text-gray-500 text-center">+{stats.pendingListings - 3} more</p>
                )}
              </div>
            )}
            <Link to="/admin/listings" className="btn-primary w-full mt-4 text-sm flex items-center justify-center gap-2">
              <ClipboardList className="w-4 h-4" /> Review All Listings
            </Link>
          </div>

          {/* Recent Orders Table */}
          <div className="card p-6 lg:col-span-2">
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary-light" /> Recent Orders
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    {['ID', 'Customer', 'Amount', 'Status', 'Date'].map((h) => (
                      <th key={h} className="text-left py-2 px-3 text-gray-400 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="text-center py-6 text-gray-500">Loading...</td></tr>
                  ) : recentOrders.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-6 text-gray-500">No orders yet</td></tr>
                  ) : recentOrders.map((order) => (
                    <tr key={order._id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                      <td className="py-2 px-3 text-primary-light font-mono text-xs">{order._id.slice(-6).toUpperCase()}</td>
                      <td className="py-2 px-3 text-sm">{order.userName}</td>
                      <td className="py-2 px-3 font-semibold text-sm">₹{Number(order.totalAmount).toLocaleString('en-IN')}</td>
                      <td className="py-2 px-3">
                        <span className={`badge text-xs ${
                          order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                          order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-gray-400 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
