import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Register from './pages/Register';
import SellVehicle from './pages/SellVehicle';
import MyListings from './pages/MyListings';
import AdminDashboard  from './pages/admin/AdminDashboard';
import AdminProducts   from './pages/admin/AdminProducts';
import AdminOrders     from './pages/admin/AdminOrders';
import AdminUsers      from './pages/admin/AdminUsers';
import AdminListings   from './pages/admin/AdminListings';
import AdminInventory  from './pages/admin/AdminInventory';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-10 h-10 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return null;
  if (!user)    return <Navigate to="/login"  replace />;
  if (!isAdmin) return <Navigate to="/"       replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-gray-950 flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public */}
                <Route path="/"             element={<Home />} />
                <Route path="/products"     element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/login"        element={<Login />} />
                <Route path="/register"     element={<Register />} />
                <Route path="/cart"         element={<Cart />} />

                {/* Protected (logged in) */}
                <Route path="/checkout"    element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/orders"      element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                <Route path="/sell"        element={<ProtectedRoute><SellVehicle /></ProtectedRoute>} />
                <Route path="/my-listings" element={<ProtectedRoute><MyListings /></ProtectedRoute>} />

                {/* Admin only */}
                <Route path="/admin"               element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/products"      element={<AdminRoute><AdminProducts /></AdminRoute>} />
                <Route path="/admin/orders"        element={<AdminRoute><AdminOrders /></AdminRoute>} />
                <Route path="/admin/users"         element={<AdminRoute><AdminUsers /></AdminRoute>} />
                <Route path="/admin/listings"      element={<AdminRoute><AdminListings /></AdminRoute>} />
                <Route path="/admin/inventory"     element={<AdminRoute><AdminInventory /></AdminRoute>} />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#1a1a2e', color: '#fff', border: '1px solid #374151' },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
