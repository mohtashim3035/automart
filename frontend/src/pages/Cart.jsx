import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, totalAmount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center text-center px-4">
        <ShoppingCart className="w-20 h-20 text-gray-700 mb-6" />
        <h2 className="text-2xl font-display font-bold mb-2">Your cart is empty</h2>
        <p className="text-gray-400 mb-8">Add some vehicles to get started!</p>
        <Link to="/products" className="btn-primary">Browse Vehicles</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold mb-8">Your Cart</h1>

        <div className="space-y-4 mb-8">
          {cart.map((item) => {
            const img = item.images?.[0] || `https://placehold.co/120x80/1a1a2e/0078D4?text=${encodeURIComponent(item.name)}`;
            return (
              <div key={item._id} className="card p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <img src={img} alt={item.name} className="w-24 h-16 object-cover rounded-xl flex-shrink-0" onError={(e) => { e.target.src = `https://placehold.co/120x80/1a1a2e/0078D4?text=Car`; }} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{item.name}</h3>
                  <p className="text-sm text-gray-400">{item.brand} · {item.year}</p>
                  <p className="text-primary-light font-bold">₹{Number(item.price).toLocaleString('en-IN')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center font-semibold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  <button onClick={() => removeFromCart(item._id)} className="text-red-400 hover:text-red-300 transition-colors mt-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="glass p-6">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xl font-semibold">Total</span>
            <span className="text-3xl font-display font-bold text-white">₹{totalAmount.toLocaleString('en-IN')}</span>
          </div>
          <button
            onClick={() => user ? navigate('/checkout') : navigate('/login')}
            className="btn-primary w-full flex items-center justify-center gap-2 text-lg"
          >
            {user ? 'Proceed to Checkout' : 'Sign in to Checkout'} <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}