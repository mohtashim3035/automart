import { useEffect, useState } from 'react';
import {
  CheckCircle, XCircle, Clock, ChevronDown, ChevronUp,
  Image as ImageIcon, User, Phone, MapPin, Eye
} from 'lucide-react';
import { listingAPI } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_TABS = [
  { key: 'pending',  label: 'Pending Review' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: '',         label: 'All' },
];

export default function AdminListings() {
  const [listings,     setListings]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState('pending');
  const [expanded,     setExpanded]     = useState({});
  const [actionModal,  setActionModal]  = useState(null);  
  const [reason,       setReason]       = useState('');
  const [adminNote,    setAdminNote]    = useState('');
  const [processing,   setProcessing]   = useState(false);
  const [lightbox,     setLightbox]     = useState(null);  

  const fetchListings = async (status) => {
    setLoading(true);
    try {
      const params = status ? { status } : {};
      const res = await listingAPI.get('/listings', { params });
      setListings(res.data.data || []);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(activeTab); }, [activeTab]);

  const toggleExpand = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const openApprove = (listing) => {
    setActionModal({ id: listing._id, type: 'approve', listing });
    setAdminNote('');
    setReason('');
  };

  const openReject = (listing) => {
    setActionModal({ id: listing._id, type: 'reject', listing });
    setReason('');
    setAdminNote('');
  };

  const handleApprove = async () => {
    setProcessing(true);
    try {
      await listingAPI.patch(`/listings/${actionModal.id}/approve`, { adminNote: adminNote || 'Approved and published.' });
      toast.success('Listing approved and published on AutoMart!');
      setActionModal(null);
      fetchListings(activeTab);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) { toast.error('Please provide a rejection reason'); return; }
    setProcessing(true);
    try {
      await listingAPI.patch(`/listings/${actionModal.id}/reject`, { reason: reason.trim() });
      toast.success('Listing rejected. Seller will see the reason.');
      setActionModal(null);
      fetchListings(activeTab);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection failed');
    } finally {
      setProcessing(false);
    }
  };

  const statusBadge = (status) => {
    const map = {
      pending:  'bg-yellow-500/20 text-yellow-400',
      approved: 'bg-green-500/20 text-green-400',
      rejected: 'bg-red-500/20 text-red-400',
    };
    return map[status] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div className="min-h-screen pt-20 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">Seller Listings Review</h1>
            <p className="text-gray-400 mt-1">Review, approve, or reject vehicle submissions from users</p>
          </div>
          <div className="badge bg-yellow-500/20 text-yellow-400 text-base px-4 py-2">
            {listings.filter((l) => l.status === 'pending').length} pending
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-primary text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Listings */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-10 h-10 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 glass rounded-2xl">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-700" />
            <p className="text-gray-500 text-lg">No listings in this category</p>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => {
              const open = expanded[listing._id];
              return (
                <div key={listing._id} className="card overflow-hidden">

                  
                  <div className="p-5 flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Thumbnail */}
                      <div className="w-24 h-16 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0 cursor-pointer"
                        onClick={() => listing.images?.[0] && setLightbox(listing.images[0])}>
                        {listing.images?.[0] ? (
                          <img src={listing.images[0]} alt={listing.name} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-gray-600" />
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="font-semibold text-base">{listing.name}</h3>
                        <p className="text-sm text-gray-400">{listing.brand} {listing.model} · {listing.year} · {listing.category}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-primary-light font-bold text-sm">₹{Number(listing.price).toLocaleString('en-IN')}</span>
                          <span className="text-gray-500 text-xs flex items-center gap-1">
                            <User className="w-3 h-3" /> {listing.sellerName}
                          </span>
                          <span className="text-gray-500 text-xs flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {listing.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`badge ${statusBadge(listing.status)}`}>
                        {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                      </span>

                      {/* Action buttons for pending */}
                      {listing.status === 'pending' && (
                        <>
                          <button
                            onClick={() => openApprove(listing)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-xs font-medium hover:bg-green-500/30 transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => openReject(listing)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-medium hover:bg-red-500/30 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => toggleExpand(listing._id)}
                        className="p-1.5 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {open && (
                    <div className="border-t border-gray-800 p-5 space-y-5 animate-fade-in">

                      
                      <div className="glass p-4 rounded-xl">
                        <h4 className="text-sm font-semibold text-gray-300 mb-3">Seller Information</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-400"><User className="w-4 h-4" /> {listing.sellerName}</div>
                          <div className="flex items-center gap-2 text-gray-400"><span className="text-xs">✉</span> {listing.sellerEmail}</div>
                          {listing.sellerPhone && (
                            <div className="flex items-center gap-2 text-gray-400"><Phone className="w-4 h-4" /> {listing.sellerPhone}</div>
                          )}
                        </div>
                      </div>

                      {/* Vehicle specs grid */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-300 mb-3">Vehicle Specifications</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                          {[
                            ['Category',     listing.category],
                            ['Condition',    listing.condition],
                            ['Fuel Type',    listing.fuelType],
                            ['Transmission', listing.transmission],
                            ['Mileage',      listing.mileage],
                            ['Color',        listing.color],
                            ['Location',     listing.location],
                            ['Images',       `${listing.images?.length || 0} uploaded`],
                          ].filter(([, v]) => v).map(([k, v]) => (
                            <div key={k} className="bg-gray-800/50 rounded-lg p-3">
                              <div className="text-xs text-gray-500 mb-0.5">{k}</div>
                              <div className="text-gray-200 capitalize">{v}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Features */}
                      {listing.features?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-300 mb-2">Features</h4>
                          <div className="flex flex-wrap gap-2">
                            {listing.features.map((f, i) => (
                              <span key={i} className="badge bg-gray-800 text-gray-300 text-xs">{f}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-300 mb-2">Description</h4>
                        <p className="text-gray-400 text-sm leading-relaxed bg-gray-800/30 rounded-xl p-4">
                          {listing.description}
                        </p>
                      </div>

                      {/* Images gallery */}
                      {listing.images?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                            <Eye className="w-4 h-4" /> Photos ({listing.images.length})
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {listing.images.map((url, i) => (
                              <div
                                key={i}
                                className="aspect-video rounded-xl overflow-hidden bg-gray-800 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                                onClick={() => setLightbox(url)}
                              >
                                <img src={url} alt={`img-${i}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">Click any image to view fullscreen</p>
                        </div>
                      )}

                      {/* Admin note */}
                      {listing.status !== 'pending' && listing.adminNote && (
                        <div className={`p-4 rounded-xl border ${listing.status === 'approved' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                          <p className="text-xs font-semibold text-gray-400 mb-1">
                            Admin note — reviewed by {listing.reviewedBy} on {new Date(listing.reviewedAt).toLocaleDateString()}
                          </p>
                          <p className={`text-sm ${listing.status === 'approved' ? 'text-green-300' : 'text-red-300'}`}>
                            {listing.adminNote}
                          </p>
                        </div>
                      )}

                      
                      {listing.status === 'pending' && (
                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={() => openApprove(listing)}
                            className="btn-primary flex items-center gap-2 flex-1 justify-center"
                          >
                            <CheckCircle className="w-4 h-4" /> Approve & Publish
                          </button>
                          <button
                            onClick={() => openReject(listing)}
                            className="flex items-center gap-2 flex-1 justify-center px-6 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-semibold hover:bg-red-500/30 transition-colors"
                          >
                            <XCircle className="w-4 h-4" /> Reject
                          </button>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Approve Modal */}
        {actionModal?.type === 'approve' && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-lg">
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2 text-green-400">
                <CheckCircle className="w-5 h-5" /> Approve Listing
              </h2>
              <p className="text-gray-400 text-sm mb-4">
                This will create a product on AutoMart and make the listing live immediately.
                The vehicle <strong className="text-white">"{actionModal.listing.name}"</strong> will be visible to all buyers.
              </p>
              <div className="mb-4">
                <label className="block text-xs text-gray-400 mb-1">Optional note to seller</label>
                <textarea
                  rows={2}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="e.g. Great listing! Published successfully."
                  className="input-field text-sm resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleApprove}
                  disabled={processing}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {processing ? (
                    <><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Publishing...</>
                  ) : (
                    <><CheckCircle className="w-4 h-4" /> Confirm Approval</>
                  )}
                </button>
                <button onClick={() => setActionModal(null)} className="btn-secondary px-5">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {actionModal?.type === 'reject' && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-lg">
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2 text-red-400">
                <XCircle className="w-5 h-5" /> Reject Listing
              </h2>
              <p className="text-gray-400 text-sm mb-4">
                Provide a clear reason so the seller understands what needs to be fixed. The reason will be shown to them on their My Listings page.
              </p>
              <div className="mb-4">
                <label className="block text-xs text-gray-400 mb-1">Rejection reason *</label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Images are unclear. Please upload higher quality photos showing the full exterior, interior, and dashboard."
                  className="input-field text-sm resize-none"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleReject}
                  disabled={processing}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-semibold hover:bg-red-500/30 transition-colors disabled:opacity-60"
                >
                  {processing ? (
                    <><div className="animate-spin w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full" /> Rejecting...</>
                  ) : (
                    <><XCircle className="w-4 h-4" /> Confirm Rejection</>
                  )}
                </button>
                <button onClick={() => setActionModal(null)} className="btn-secondary px-5">Cancel</button>
              </div>
            </div>
          </div>
        )}

        
        {lightbox && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setLightbox(null)}
          >
            <img
              src={lightbox}
              alt="fullscreen"
              className="max-w-full max-h-full object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-gray-800/80 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
            >
              <XCircle className="w-5 h-5 text-white" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}