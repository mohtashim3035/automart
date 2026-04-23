import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock, CheckCircle, XCircle, Car, PlusCircle, ChevronDown, ChevronUp, Image as ImageIcon
} from 'lucide-react';
import { listingAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const STATUS_CONFIG = {
  pending:  { label: 'Pending Review', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', icon: Clock },
  approved: { label: 'Approved & Live',color: 'text-green-400 bg-green-500/10 border-green-500/20',  icon: CheckCircle },
  rejected: { label: 'Rejected',        color: 'text-red-400 bg-red-500/10 border-red-500/20',        icon: XCircle },
};

export default function MyListings() {
  const [listings,  setListings]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [expanded,  setExpanded]  = useState({});

  useEffect(() => {
    listingAPI.get('/listings/my-listings')
      .then((r) => setListings(r.data.data || []))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">My Listings</h1>
            <p className="text-gray-400 mt-1">Track the status of your submitted vehicles</p>
          </div>
          <Link to="/sell" className="btn-primary py-2 px-4 flex items-center gap-2 text-sm">
            <PlusCircle className="w-4 h-4" /> Sell Another
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-20 glass">
            <Car className="w-16 h-16 mx-auto mb-4 text-gray-700" />
            <h2 className="text-xl font-semibold mb-2">No listings yet</h2>
            <p className="text-gray-500 mb-6">Submit your first vehicle for sale on AutoMart.</p>
            <Link to="/sell" className="btn-primary">Sell Your Vehicle</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => {
              const cfg  = STATUS_CONFIG[listing.status] || STATUS_CONFIG.pending;
              const Icon = cfg.icon;
              const open = expanded[listing._id];

              return (
                <div key={listing._id} className="card overflow-hidden">
                  
                  <div className="p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">

                    <div className="flex items-center gap-4">
                      <div className="w-20 h-14 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                        {listing.images && listing.images[0] ? (
                          <img src={listing.images[0]} alt={listing.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-base">{listing.name}</h3>
                        <p className="text-sm text-gray-400">{listing.brand} · {listing.model} · {listing.year}</p>
                        <p className="text-primary-light font-bold text-sm mt-0.5">
                          ₹{Number(listing.price).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                    
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`badge border ${cfg.color} flex items-center gap-1.5`}>
                        <Icon className="w-3 h-3" /> {cfg.label}
                      </span>
                      <button
                        onClick={() => toggleExpand(listing._id)}
                        className="p-1.5 rounded-lg hover:bg-gray-700 transition-colors"
                        aria-label="Toggle details"
                      >
                        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {open && (
                    <div className="border-t border-gray-800 p-5 space-y-4 animate-fade-in">

                      {/* Rejection message */}
                      {listing.status === 'rejected' && listing.adminNote && (
                        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                          <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-red-400 mb-1">Rejection Reason</p>
                            <p className="text-sm text-red-300">{listing.adminNote}</p>
                          </div>
                        </div>
                      )}

                      {/* Approval message */}
                      {listing.status === 'approved' && (
                        <div className="flex items-start gap-3 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-green-400 mb-1">Your listing is live!</p>
                            <p className="text-sm text-green-300">
                              {listing.adminNote || 'Your vehicle has been approved and is now visible to buyers on AutoMart.'}
                            </p>
                            {listing.publishedProductId && (
                              <Link
                                to={`/products/${listing.publishedProductId}`}
                                className="text-sm text-primary-light hover:underline mt-2 inline-block"
                              >
                                View live listing →
                              </Link>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Pending message */}
                      {listing.status === 'pending' && (
                        <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                          <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-yellow-400 mb-1">Under review</p>
                            <p className="text-sm text-yellow-300">
                              Our team is reviewing your submission. This typically takes up to 24 hours.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Vehicle details grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                        {[
                          ['Category',     listing.category],
                          ['Condition',    listing.condition],
                          ['Fuel',         listing.fuelType],
                          ['Transmission', listing.transmission],
                          ['Mileage',      listing.mileage],
                          ['Location',     listing.location],
                        ].filter(([, v]) => v).map(([k, v]) => (
                          <div key={k} className="bg-gray-800/50 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-0.5">{k}</div>
                            <div className="text-gray-200 capitalize">{v}</div>
                          </div>
                        ))}
                      </div>

                      {/* Images strip */}
                      {listing.images && listing.images.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {listing.images.map((url, i) => (
                            <img
                              key={i}
                              src={url}
                              alt={`img-${i}`}
                              className="w-24 h-16 rounded-lg object-cover flex-shrink-0"
                            />
                          ))}
                        </div>
                      )}

                      {/* Meta */}
                      <div className="flex justify-between text-xs text-gray-500 pt-2 border-t border-gray-800">
                        <span>Submitted: {new Date(listing.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        {listing.reviewedAt && (
                          <span>Reviewed: {new Date(listing.reviewedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        )}
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}