import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, MapPin, CheckCircle } from 'lucide-react';
import { orderAPI, paymentAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { cart, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({ street: '', city: '', state: '', pincode: '' });
  const [method,  setMethod]  = useState('card');

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) { toast.error('Your cart is empty'); return; }
    setLoading(true);
    try {
      // Create order
      const orderRes = await orderAPI.post('/orders', {
        items: cart.map((i) => ({
          productId: i._id,
          name:      i.name,
          price:     i.price,
          quantity:  i.quantity,
          image:     i.images?.[0] || '',
        })),
        totalAmount,
        shippingAddress: address,
      });
      const order = orderRes.data.data;

      // Process payment
      await paymentAPI.post('/payments', {
        orderId: order._id,
        amount:  totalAmount,
        method,
      });

      clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form onSubmit={handleCheckout} className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-light" /> Shipping Address
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <input required placeholder="Street Address" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} className="input-field" />
                <div className="grid grid-cols-2 gap-4">
                  <input required placeholder="City" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} className="input-field" />
                  <input required placeholder="State" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} className="input-field" />
                </div>
                <input required placeholder="Pincode" value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} className="input-field" />
              </div>
            </div>

            {/* Payment Method */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary-light" /> Payment Method
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {['card', 'upi', 'netbanking', 'cod'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                      method === m
                        ? 'border-primary bg-primary/10 text-primary-light'
                        : 'border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {m === 'cod' ? 'Cash on Delivery' : m.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full text-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:hover:scale-100">
              {loading ? 'Placing Order...' : <><CheckCircle className="w-5 h-5" /> Place Order</>}
            </button>
          </form>

          {/* Order Summary */}
          <div className="card p-6 h-fit">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {cart.map((item) => (
                <div key={item._id} className="flex justify-between text-sm">
                  <span className="text-gray-400 truncate flex-1 mr-2">{item.name} × {item.quantity}</span>
                  <span className="font-medium flex-shrink-0">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-700 pt-4 flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-xl text-white">₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}