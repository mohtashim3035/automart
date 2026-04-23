import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, AlertTriangle, TrendingDown, ShoppingBag,
  RefreshCw, Warehouse, ArrowLeft
} from 'lucide-react';
import { inventoryAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminInventory() {
  const [inventory,  setInventory]  = useState([]);
  const [lowStock,   setLowStock]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (showToast = false) => {
    setRefreshing(true);
    try {
      const [invRes, lowRes] = await Promise.all([
        inventoryAPI.get('/inventory'),
        inventoryAPI.get('/inventory/low-stock'),
      ]);
      setInventory(invRes.data.data || []);
      setLowStock(lowRes.data.data  || []);
      if (showToast) toast.success('Inventory refreshed');
    } catch {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  
  const totalProducts    = inventory.length;
  const totalStock       = inventory.reduce((s, i) => s + (i.stock || 0), 0);
  const totalSold        = inventory.reduce((s, i) => s + (i.sold  || 0), 0);
  const lowStockCount    = lowStock.length;
  const outOfStockCount  = inventory.filter((i) => i.stock === 0).length;

  const statCards = [
    { label: 'Total Products',   value: totalProducts,   icon: Package,      color: 'text-blue-400',   bg: 'bg-blue-500/10' },
    { label: 'Units In Stock',   value: totalStock,      icon: Warehouse,    color: 'text-green-400',  bg: 'bg-green-500/10' },
    { label: 'Units Sold',       value: totalSold,       icon: ShoppingBag,  color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Low Stock Items',  value: lowStockCount,   icon: AlertTriangle,color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Out of Stock',     value: outOfStockCount, icon: TrendingDown, color: 'text-red-400',    bg: 'bg-red-500/10' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-8">

        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              className="p-2 rounded-xl hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-display font-bold">Inventory</h1>
              <p className="text-gray-400 mt-1">Live stock levels across all products</p>
            </div>
          </div>
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="btn-secondary py-2 px-4 flex items-center gap-2 text-sm disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card p-5">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className="text-2xl font-bold font-display">{value}</div>
              <div className="text-xs text-gray-400 mt-1">{label}</div>
            </div>
          ))}
        </div>

    
        {lowStock.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400">Low Stock Alerts</span>
              <span className="badge bg-yellow-500/20 text-yellow-400">{lowStock.length}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStock.map((item) => (
                <div
                  key={item._id}
                  className="card p-4 border-yellow-500/30 border"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{item.productName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.location}</p>
                    </div>
                    <span className={`badge flex-shrink-0 ${
                      item.stock === 0
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {item.stock === 0 ? 'Out of stock' : `${item.stock} left`}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-4 text-xs text-gray-500">
                    <span>Sold: <strong className="text-gray-300">{item.sold || 0}</strong></span>
                    <span>Threshold: <strong className="text-gray-300">{item.lowStockThreshold}</strong></span>
                  </div>
                  {/* Visual stock bar */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          item.stock === 0 ? 'bg-red-500' : 'bg-yellow-400'
                        }`}
                        style={{
                          width: `${Math.min(100, (item.stock / Math.max(item.lowStockThreshold * 2, 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Full Inventory Table ── */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Warehouse className="w-5 h-5 text-primary-light" />
            All Inventory Records
            <span className="text-sm text-gray-500 font-normal ml-1">({inventory.length} products)</span>
          </h2>

          {inventory.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Package className="w-14 h-14 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-semibold text-gray-400 mb-2">No inventory records yet</p>
              <p className="text-sm">
                Records are created automatically when you add products from the{' '}
                <Link to="/admin/products" className="text-primary-light hover:underline">
                  Products page
                </Link>.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    {['Product', 'Stock', 'Sold', 'Reserved', 'Location', 'Status', 'Last Updated'].map((h) => (
                      <th key={h} className="text-left py-3 px-4 text-gray-400 font-medium whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => {
                    const isOut  = item.stock === 0;
                    const isLow  = !isOut && item.stock <= item.lowStockThreshold;
                    const isGood = !isOut && !isLow;
                    return (
                      <tr
                        key={item._id}
                        className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">
                            {item.productId?.slice(-8).toUpperCase()}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-bold">{item.stock}</span>
                            {/* Mini stock bar */}
                            <div className="w-16 bg-gray-700 rounded-full h-1.5 hidden sm:block">
                              <div
                                className={`h-1.5 rounded-full ${
                                  isOut ? 'bg-red-500' : isLow ? 'bg-yellow-400' : 'bg-green-400'
                                }`}
                                style={{
                                  width: `${Math.min(100, (item.stock / Math.max((item.lowStockThreshold || 2) * 3, 1)) * 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-300">{item.sold || 0}</td>
                        <td className="py-3 px-4 text-gray-400">{item.reserved || 0}</td>
                        <td className="py-3 px-4 text-gray-400">{item.location || 'Warehouse A'}</td>
                        <td className="py-3 px-4">
                          <span className={`badge ${
                            isOut  ? 'bg-red-500/20 text-red-400' :
                            isLow  ? 'bg-yellow-500/20 text-yellow-400' :
                                     'bg-green-500/20 text-green-400'
                          }`}>
                            {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500 text-xs whitespace-nowrap">
                          {new Date(item.updatedAt).toLocaleDateString('en-IN', {
                            day:   'numeric',
                            month: 'short',
                            year:  'numeric',
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}