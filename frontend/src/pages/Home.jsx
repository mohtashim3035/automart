import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Award, Car, Bike } from 'lucide-react';
import { productAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import VehicleCard from '../components/VehicleCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    productAPI.get('/products/featured')
      .then((r) => setFeatured(r.data.data || []))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="overflow-hidden">
      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center bg-hero-gradient">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto animate-fade-in">
          <div className="badge bg-primary/20 text-primary-light border border-primary/30 mb-6 mx-auto">
            <Zap className="w-3 h-3" /> United State's #1 Vehicle Marketplace
          </div>
          <h1 className="text-6xl md:text-8xl font-display font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Drive Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary-light to-primary bg-clip-text text-transparent">
              Dream Vehicle
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Discover thousands of premium cars and bikes. Best prices, verified sellers, and a seamless buying experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products?category=car"  className="btn-primary text-lg px-8 py-4 flex items-center gap-2">
              <Car className="w-5 h-5" /> Browse Cars <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/products?category=bike" className="btn-secondary text-lg px-8 py-4 flex items-center gap-2">
              <Bike className="w-5 h-5" /> Explore Bikes
            </Link>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-20 max-w-2xl mx-auto">
            {[['10,000+', 'Vehicles Listed'], ['50,000+', 'Happy Customers'], ['4.9★', 'Customer Rating']].map(([v, l]) => (
              <div key={l} className="text-center">
                <div className="text-3xl font-display font-bold text-white">{v}</div>
                <div className="text-gray-400 text-sm mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-display font-bold text-center mb-4">Why AutoMart?</h2>
          <p className="text-gray-400 text-center mb-16">Everything you need in one place</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Verified Listings',  desc: 'Every vehicle is verified by our expert team before listing.' },
              { icon: Zap,    title: 'Instant Process',    desc: 'Book a test drive or buy online in just a few minutes.' },
              { icon: Award,  title: 'Best Prices',        desc: 'Compare prices and get the best deal guaranteed.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-8 text-center group">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-8 h-8 text-primary-light" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{title}</h3>
                <p className="text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED VEHICLES */}
      <section className="py-24 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-display font-bold mb-2">Featured Vehicles</h2>
              <p className="text-gray-400">Handpicked premium listings just for you</p>
            </div>
            <Link to="/products" className="btn-secondary hidden md:flex items-center gap-2">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <LoadingSpinner size="lg" />
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featured.map((p) => <VehicleCard key={p._id} product={p} />)}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500">
              <Car className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>No featured vehicles yet. Add products from the admin panel.</p>
            </div>
          )}
        </div>
      </section>

      
      {!user && (
        <section className="py-24 bg-azure-gradient">
          <div className="max-w-3xl mx-auto text-center px-4">
            <h2 className="text-4xl font-display font-bold text-white mb-4">Ready to find your dream ride?</h2>
            <p className="text-blue-100 mb-8 text-lg">Join thousands of happy customers who found their perfect vehicle on AutoMart.</p>
            <Link to="/register" className="bg-white text-primary font-bold px-8 py-4 rounded-xl hover:scale-105 transition-transform inline-block">
              Get Started Free
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
