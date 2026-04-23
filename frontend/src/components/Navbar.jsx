import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, User, LogOut, Car, LayoutDashboard,
  Menu, X, PlusCircle, ClipboardList
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import LogoutModal from './LogoutModal';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [scrolled,         setScrolled]         = useState(false);
  const [menuOpen,         setMenuOpen]         = useState(false);
  const [showLogoutModal,  setShowLogoutModal]  = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  
  const handleNavClick = () => setMenuOpen(false);

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    setMenuOpen(false);
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/products',             label: 'Browse',  icon: null },
    { to: '/products?category=car',  label: 'Cars',    icon: null },
    { to: '/products?category=bike', label: 'Bikes',   icon: null },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-gray-900/95 backdrop-blur-lg shadow-lg shadow-black/20'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            
            <Link to="/" onClick={handleNavClick} className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-display font-bold bg-gradient-to-r from-primary-light to-white bg-clip-text text-transparent">
                AutoMart
              </span>
            </Link>

            
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="text-gray-300 hover:text-white hover:bg-gray-800/60 transition-all px-4 py-2 rounded-xl text-sm font-medium"
                >
                  {label}
                </Link>
              ))}

              {user && !isAdmin && (
                <>
                  <Link
                    to="/sell"
                    className="text-gray-300 hover:text-white hover:bg-gray-800/60 transition-all px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" /> Sell
                  </Link>
                  <Link
                    to="/my-listings"
                    className="text-gray-300 hover:text-white hover:bg-gray-800/60 transition-all px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5"
                  >
                    <ClipboardList className="w-4 h-4" /> My Listings
                  </Link>
                </>
              )}
            </div>

            
            <div className="flex items-center gap-2">

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2 rounded-xl hover:bg-gray-800 transition-colors"
              >
                <ShoppingCart className="w-5 h-5 text-gray-300" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center animate-scale-in">
                    {totalItems}
                  </span>
                )}
              </Link>

              {user ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="btn-primary py-2 px-4 flex items-center gap-2 text-sm"
                    >
                      <LayoutDashboard className="w-4 h-4" /> Admin
                    </Link>
                  )}
                  <Link
                    to="/orders"
                    className="p-2 rounded-xl hover:bg-gray-800 transition-colors"
                    title="My Orders"
                  >
                    <User className="w-5 h-5 text-gray-300" />
                  </Link>
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="p-2 rounded-xl hover:bg-red-900/30 transition-colors"
                    title="Sign out"
                  >
                    <LogOut className="w-5 h-5 text-red-400" />
                  </button>
                </>
              ) : (
                <Link to="/login" className="btn-primary py-2 px-4 text-sm">
                  Sign In
                </Link>
              )}

              
              <button
                className="md:hidden p-2 rounded-xl hover:bg-gray-800 transition-colors"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                {menuOpen
                  ? <X    className="w-5 h-5 text-gray-300" />
                  : <Menu className="w-5 h-5 text-gray-300" />
                }
              </button>
            </div>
          </div>


          {menuOpen && (
            <div className="md:hidden bg-gray-900/98 backdrop-blur-lg border-t border-gray-800 py-3 space-y-1 animate-fade-in">

              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={handleNavClick}
                  className="flex items-center px-4 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-sm"
                >
                  {label}
                </Link>
              ))}

              {user && !isAdmin && (
                <>
                  <Link
                    to="/sell"
                    onClick={handleNavClick}
                    className="flex items-center gap-2 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-sm"
                  >
                    <PlusCircle className="w-4 h-4" /> Sell Your Vehicle
                  </Link>
                  <Link
                    to="/my-listings"
                    onClick={handleNavClick}
                    className="flex items-center gap-2 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-sm"
                  >
                    <ClipboardList className="w-4 h-4" /> My Listings
                  </Link>
                </>
              )}

              {user && (
                <>
                  <Link
                    to="/orders"
                    onClick={handleNavClick}
                    className="flex items-center gap-2 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-sm"
                  >
                    <User className="w-4 h-4" /> My Orders
                  </Link>
                  <div className="border-t border-gray-800 mt-2 pt-2">
                    <button
                      onClick={() => { setMenuOpen(false); setShowLogoutModal(true); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors text-sm"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </>
              )}

              {!user && (
                <div className="pt-2 px-4">
                  <Link
                    to="/login"
                    onClick={handleNavClick}
                    className="btn-primary w-full flex items-center justify-center text-sm py-2.5"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      <LogoutModal
        isOpen={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutModal(false)}
      />
    </>
  );
}
