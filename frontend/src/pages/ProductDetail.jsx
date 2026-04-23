import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Star, Fuel, Settings, Calendar, CheckCircle } from 'lucide-react';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productAPI.get(`/products/${id}`)
      .then((r) => setProduct(r.data.data))
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div className="min-h-screen pt-20 flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  if (!product) return null;

  const defaultImg = `https://placehold.co/800x500/1a1a2e/0078D4?text=${encodeURIComponent(product.name)}`;

  return (
    <div className="min-h-screen pt-20 bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="rounded-2xl overflow-hidden h-80 lg:h-96">
            <img
              src={product.images?.[0] || defaultImg}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = defaultImg; }}
            />
          </div>

          {/* Details */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge bg-primary/20 text-primary-light">{product.category.toUpperCase()}</span>
              {product.isFeatured && <span className="badge bg-accent/20 text-accent-light">Featured</span>}
            </div>
            <h1 className="text-3xl font-display font-bold mb-2">{product.name}</h1>
            <p className="text-primary-light font-medium mb-4">{product.brand} · {product.model} · {product.year}</p>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'opacity-30'}`} />
                ))}
              </div>
              <span className="text-gray-400 text-sm">({product.reviewCount} reviews)</span>
            </div>

            <div className="text-4xl font-display font-bold text-white mb-6">
              ₹{Number(product.price).toLocaleString('en-IN')}
            </div>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                ['Year',         product.year,         Calendar],
                ['Fuel Type',    product.fuelType,     Fuel],
                ['Transmission', product.transmission, Settings],
                ['Color',        product.color,        CheckCircle],
              ].filter(([, v]) => v).map(([label, value, Icon]) => (
                <div key={label} className="glass p-3 flex items-center gap-2">
                  <Icon className="w-4 h-4 text-primary-light flex-shrink-0" />
                  <div>
                    <div className="text-xs text-gray-500">{label}</div>
                    <div className="text-sm font-medium capitalize">{value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Features */}
            {product.features?.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {product.features.map((f) => (
                    <span key={f} className="badge bg-gray-800 text-gray-300">{f}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <p className="text-gray-400 mb-8 leading-relaxed">{product.description}</p>

            <div className="flex gap-4">
              <button
                onClick={() => addToCart(product)}
                disabled={product.stock === 0}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <ShoppingCart className="w-5 h-5" />
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-3">
              {product.stock > 0 ? `${product.stock} unit(s) available` : 'Currently unavailable'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}