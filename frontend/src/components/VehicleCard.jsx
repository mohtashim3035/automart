import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Fuel, Settings, Calendar } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function VehicleCard({ product }) {
  const { addToCart } = useCart();
  const defaultImg = `https://placehold.co/400x250/1a1a2e/0078D4?text=${encodeURIComponent(product.name)}`;

  return (
    <div className="card group">
      {/* Image */}
      <div className="relative overflow-hidden h-52">
        <img
          src={product.images?.[0] || defaultImg}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => { e.target.src = defaultImg; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="badge bg-primary/90 text-white">{product.category.toUpperCase()}</span>
          {product.isFeatured && <span className="badge bg-accent/90 text-white">Featured</span>}
        </div>
        <div className="absolute bottom-3 right-3">
          <span className={`badge ${product.stock > 0 ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
            {product.stock > 0 ? 'In Stock' : 'Sold Out'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-primary-light font-medium">{product.brand}</span>
          <div className="flex items-center gap-1 text-yellow-400">
            <Star className="w-3 h-3 fill-current" />
            <span className="text-xs text-gray-400">{Number(product.rating).toFixed(1)}</span>
          </div>
        </div>

        <h3 className="font-semibold text-lg mb-3 line-clamp-1">{product.name}</h3>

        <div className="flex gap-4 mb-4 text-xs text-gray-400">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{product.year}</span>
          {product.fuelType     && <span className="flex items-center gap-1"><Fuel className="w-3 h-3" />{product.fuelType}</span>}
          {product.transmission && <span className="flex items-center gap-1"><Settings className="w-3 h-3" />{product.transmission}</span>}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold font-display text-white">
            ₹{Number(product.price).toLocaleString('en-IN')}
          </span>
          <div className="flex gap-2">
            <Link to={`/products/${product._id}`} className="btn-secondary py-2 px-3 text-sm">
              Details
            </Link>
            <button
              onClick={() => addToCart(product)}
              disabled={product.stock === 0}
              className="btn-primary py-2 px-3 text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}