import { Link } from 'react-router-dom';
import {
  Car, Mail, Phone, MapPin,
  Globe2, SquareAsteriskIcon, Share2, SquareStarIcon,
  ArrowRight, Shield, Zap, Award
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 border-t border-gray-800">

    
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Verified Sellers', desc: 'Every listing is verified before going live' },
              { icon: Zap, title: 'Fast & Easy', desc: 'Buy or sell your vehicle in minutes' },
              { icon: Award, title: 'Best Prices', desc: 'Get the most competitive deals in India' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary-light" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{title}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-5 group w-fit">
              <div className="w-11 h-11 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">AutoMart</span>
            </Link>

            <p className="text-gray-400 text-sm mb-6 max-w-xs">
              United State's vehicle marketplace. Buy and sell cars and bikes with confidence.
            </p>

            {/* Newsletter */}
            <div className="mb-6">
              <p className="text-white text-sm mb-2">Get updates</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white"
                />
                <button className="bg-primary text-white px-4 rounded flex items-center">
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            
            <div className="flex gap-3">
              {[
                { icon: Globe2, href: 'https://instagram.com' },
                { icon: SquareAsteriskIcon, href: 'https://twitter.com' },
                { icon: Share2, href: 'https://facebook.com' },
                { icon: SquareStarIcon, href: 'https://youtube.com' },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 border border-gray-700 rounded flex items-center justify-center text-gray-400 hover:text-white"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          
          <div>
            <h3 className="text-white mb-4">Browse</h3>
            <ul className="space-y-2">
              {[
                { label: 'All Vehicles', href: '/products' },
                { label: 'Cars', href: '/products?category=car' },
                { label: 'Bikes', href: '/products?category=bike' },
                { label: 'Sell Vehicle', href: '/sell' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link to={href} className="text-gray-400 hover:text-white text-sm">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-white mb-4">Account</h3>
            <ul className="space-y-2">
              {[
                { label: 'Login', href: '/login' },
                { label: 'Register', href: '/register' },
                { label: 'Orders', href: '/orders' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link to={href} className="text-gray-400 hover:text-white text-sm">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white mb-4">Contact</h3>
            <div className="space-y-3 text-gray-400 text-sm">
              <p className="flex items-center gap-2"><Mail size={14}/> support@automart.com</p>
              <p className="flex items-center gap-2"><Phone size={14}/> +1 312 555 1234</p>
              <p className="flex items-center gap-2"><MapPin size={14}/> Chicago, United States</p>
            </div>
          </div>

        </div>
      </div>

      
      <div className="border-t border-gray-800 text-center py-4 text-gray-500 text-sm">
        © {currentYear} AutoMart. All rights reserved.
      </div>

    </footer>
  );
}