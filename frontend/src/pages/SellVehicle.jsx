import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car, Upload, X, CheckCircle, AlertCircle, Image as ImageIcon,
  DollarSign, MapPin, FileText, Wrench
} from 'lucide-react';
import { listingAPI } from '../services/api';
import toast from 'react-hot-toast';

const INITIAL_FORM = {
  name:         '',
  brand:        '',
  model:        '',
  year:         new Date().getFullYear(),
  price:        '',
  category:     'car',
  condition:    'good',
  fuelType:     'petrol',
  transmission: 'manual',
  mileage:      '',
  color:        '',
  location:     '',
  description:  '',
  features:     '',
  sellerPhone:  '',
};

export default function SellVehicle() {
  const navigate = useNavigate();
  const [form,        setForm]        = useState(INITIAL_FORM);
  const [images,      setImages]      = useState([]);    
  const [previews,    setPreviews]    = useState([]);    
  const [loading,     setLoading]     = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [dragOver,    setDragOver]    = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleImageFiles = (files) => {
    const valid = Array.from(files).filter((f) =>
      ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(f.type)
    );
    if (valid.length === 0) { toast.error('Only JPG, PNG, WebP images allowed'); return; }
    if (images.length + valid.length > 8) { toast.error('Maximum 8 images allowed'); return; }

    const newPreviews = valid.map((f) => URL.createObjectURL(f));
    setImages((prev)   => [...prev,   ...valid]);
    setPreviews((prev) => [...prev,   ...newPreviews]);
  };

  const handleFileInput = (e) => handleImageFiles(e.target.files);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleImageFiles(e.dataTransfer.files);
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(previews[index]);
    setImages((prev)   => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) { toast.error('Please upload at least one image'); return; }

    setLoading(true);
    try {
      const formData = new FormData();

      // Append all form fields
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Append images
      images.forEach((file) => {
        formData.append('images', file);
      });

      await listingAPI.post('/listings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          // Upload progress feedback in console
          const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          if (pct === 100) toast.loading('Processing images...', { id: 'upload' });
        },
      });

      toast.dismiss('upload');
      setSubmitted(true);
      // Revoke all object URLs to free memory
      previews.forEach((p) => URL.revokeObjectURL(p));
    } catch (err) {
      toast.dismiss('upload');
      toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (submitted) {
    return (
      <div className="min-h-screen pt-20 bg-gray-950 flex items-center justify-center px-4">
        <div className="glass p-12 text-center max-w-md w-full animate-scale-in">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-2xl font-display font-bold mb-3">Listing Submitted!</h2>
          <p className="text-gray-400 mb-2">
            Your vehicle has been submitted for review. Our team will check the details and images.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            You can track the status of your submission on the My Listings page.
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={() => navigate('/my-listings')} className="btn-primary w-full">
              View My Listings
            </button>
            <button
              onClick={() => { setSubmitted(false); setForm(INITIAL_FORM); setImages([]); setPreviews([]); }}
              className="btn-secondary w-full"
            >
              Submit Another Vehicle
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
              <Car className="w-5 h-5 text-primary-light" />
            </div>
            <h1 className="text-3xl font-display font-bold">Sell Your Vehicle</h1>
          </div>
          <p className="text-gray-400">
            Fill in the details below. Our team will review and publish your listing within 24 hours.
          </p>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-8">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-300">
            <span className="font-semibold">How it works: </span>
            Submit your vehicle details and images. Our admin team reviews every listing for quality.
            Approved listings appear live on AutoMart. You can track status on My Listings.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
              <Car className="w-5 h-5 text-primary-light" /> Vehicle Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Listing Title *</label>
                <input
                  type="text" name="name" required
                  placeholder="e.g. 2021 Honda City ZX Automatic — Low Mileage"
                  value={form.name} onChange={handleChange} className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Category *</label>
                <select name="category" value={form.category} onChange={handleChange} className="input-field">
                  <option value="car">Car</option>
                  <option value="bike">Bike / Motorcycle</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Brand *</label>
                <input
                  type="text" name="brand" required
                  placeholder="e.g. Honda, Tesla, Toyota"
                  value={form.brand} onChange={handleChange} className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Model *</label>
                <input
                  type="text" name="model" required
                  placeholder="e.g. Honda CR-V, Ford F-150, BMW"
                  value={form.model} onChange={handleChange} className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Manufacturing Year *</label>
                <input
                  type="number" name="year" required
                  min="1990" max={new Date().getFullYear()}
                  value={form.year} onChange={handleChange} className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Condition *</label>
                <select name="condition" value={form.condition} onChange={handleChange} className="input-field">
                  <option value="new">New / Unregistered</option>
                  <option value="excellent">Excellent (like new)</option>
                  <option value="good">Good (minor wear)</option>
                  <option value="fair">Fair (visible wear)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Color</label>
                <input
                  type="text" name="color"
                  placeholder="e.g. Pearl White, Midnight Black"
                  value={form.color} onChange={handleChange} className="input-field"
                />
              </div>

            </div>
          </div>

          
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary-light" /> Technical Specifications
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              <div>
                <label className="block text-xs text-gray-400 mb-1">Fuel Type</label>
                <select name="fuelType" value={form.fuelType} onChange={handleChange} className="input-field">
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="cng">CNG</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Transmission</label>
                <select name="transmission" value={form.transmission} onChange={handleChange} className="input-field">
                  <option value="manual">Manual</option>
                  <option value="automatic">Automatic</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Mileage / Odometer</label>
                <input
                  type="text" name="mileage"
                  placeholder="e.g. 45,000 km"
                  value={form.mileage} onChange={handleChange} className="input-field"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs text-gray-400 mb-1">Features (comma separated)</label>
                <input
                  type="text" name="features"
                  placeholder="e.g. Sunroof, ABS, Reverse Camera, Bluetooth, Heated Seats"
                  value={form.features} onChange={handleChange} className="input-field"
                />
              </div>

            </div>
          </div>

          
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary-light" /> Pricing & Location
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <label className="block text-xs text-gray-400 mb-1">Asking Price (₹) *</label>
                <input
                  type="number" name="price" required min="1000"
                  placeholder="e.g. 850000"
                  value={form.price} onChange={handleChange} className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Your Location *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text" name="location" required
                    placeholder="e.g. Chicago, United States"
                    value={form.location} onChange={handleChange} className="input-field pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Your Contact Phone</label>
                <input
                  type="tel" name="sellerPhone"
                  placeholder="+1 312 555 1234"
                  value={form.sellerPhone} onChange={handleChange} className="input-field"
                />
              </div>

            </div>
          </div>

          
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-light" /> Description
            </h2>
            <textarea
              name="description" required rows={5}
              placeholder="Describe the vehicle in detail. Include service history, any modifications, reason for selling, known issues (if any), etc."
              value={form.description} onChange={handleChange}
              className="input-field resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              Tip: Honest, detailed descriptions get approved faster and attract more serious buyers.
            </p>
          </div>

          
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary-light" /> Vehicle Photos
            </h2>
            <p className="text-gray-400 text-sm mb-5">
              Upload 1–8 photos. Include exterior, interior, dashboard, engine bay. JPG, PNG, WebP — max 10 MB each.
            </p>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
                dragOver
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-700 hover:border-primary/50 hover:bg-gray-800/30'
              }`}
              onClick={() => document.getElementById('image-input').click()}
            >
              <Upload className="w-8 h-8 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">Drag and drop images here</p>
              <p className="text-gray-500 text-sm mt-1">or click to browse files</p>
              <input
                type="file" id="image-input" multiple accept="image/jpeg,image/png,image/webp"
                className="hidden" onChange={handleFileInput}
              />
            </div>

            {/* Image previews */}
            {previews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                {previews.map((src, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden aspect-video bg-gray-800">
                    <img src={src} alt={`preview-${i}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                    {i === 0 && (
                      <div className="absolute bottom-1 left-1 bg-primary/80 text-white text-xs px-2 py-0.5 rounded">
                        Cover
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-500 mt-2">
              {images.length}/8 images added · First image will be used as cover photo
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-3 disabled:opacity-60 disabled:hover:scale-100"
          >
            {loading ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                Uploading & Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" /> Submit for Review
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-500 pb-4">
            By submitting, you confirm this is your vehicle and the information provided is accurate.
          </p>

        </form>
      </div>
    </div>
  );
}