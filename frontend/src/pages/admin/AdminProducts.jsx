import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Check, Upload, Image as ImageIcon } from 'lucide-react';
import { productAPI, listingAPI } from '../../services/api';
import toast from 'react-hot-toast';

const emptyForm = {
  name: '', description: '', price: '', category: 'car', brand: '',
  model: '', year: new Date().getFullYear(), fuelType: 'petrol',
  transmission: 'manual', color: '', stock: 1, isFeatured: false, features: '',
};

export default function AdminProducts() {
  const [products,  setProducts]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [form,      setForm]      = useState(emptyForm);
  const [saving,    setSaving]    = useState(false);

  // Image state
  const [images,    setImages]    = useState([]);     
  const [previews,  setPreviews]  = useState([]);     
  const [existingImages, setExistingImages] = useState([]);
  const [uploadingImgs,  setUploadingImgs]  = useState(false);
  const [dragOver,  setDragOver]  = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productAPI.get('/products?limit=100');
      setProducts(res.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const resetImageState = () => {
    previews.forEach((p) => URL.revokeObjectURL(p));
    setImages([]);
    setPreviews([]);
    setExistingImages([]);
  };

  const openAdd = () => {
    setForm(emptyForm);
    setEditing(null);
    resetImageState();
    setShowForm(true);
  };

  const openEdit = (p) => {
    setForm({
      ...p,
      price:    p.price,
      year:     p.year,
      stock:    p.stock,
      features: (p.features || []).join(', '),
    });
    setEditing(p._id);
    resetImageState();
    setExistingImages(p.images || []);
    setImages([]);
    setPreviews([]);
    setShowForm(true);
  };

  const closeForm = () => {
    resetImageState();
    setShowForm(false);
  };

  // Image handling
  const handleImageFiles = (files) => {
    const valid = Array.from(files).filter((f) =>
      ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(f.type)
    );
    if (valid.length === 0) { toast.error('Only JPG, PNG, WebP images are allowed'); return; }
    const totalSlots = existingImages.length + images.length + valid.length;
    if (totalSlots > 8) { toast.error('Maximum 8 images total'); return; }

    const newPreviews = valid.map((f) => URL.createObjectURL(f));
    setImages((prev)   => [...prev,   ...valid]);
    setPreviews((prev) => [...prev,   ...newPreviews]);
  };

  const handleFileInput  = (e) => handleImageFiles(e.target.files);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleImageFiles(e.dataTransfer.files);
  };

  const removeNewImage = (index) => {
    URL.revokeObjectURL(previews[index]);
    setImages((prev)   => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadNewImages = async () => {
    if (images.length === 0) return [];
    setUploadingImgs(true);
    const uploadedUrls = [];
    try {
      // Upload all new images as a batch using the listing-service multipart endpoint
      const formData = new FormData();
      images.forEach((file) => formData.append('images', file));
      
      const res = await listingAPI.post('/listings/upload-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.urls || [];
    } catch {
      toast.error('Image upload failed. Product will be saved without new images.');
      return uploadedUrls;
    } finally {
      setUploadingImgs(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Upload any new images first
      const newImageUrls = await uploadNewImages();
      const allImageUrls = [...existingImages, ...newImageUrls];

      const payload = {
        ...form,
        price:    Number(form.price),
        year:     Number(form.year),
        stock:    Number(form.stock),
        features: form.features ? form.features.split(',').map((f) => f.trim()).filter(Boolean) : [],
        images:   allImageUrls,
      };

      if (editing) {
        await productAPI.put(`/products/${editing}`, payload);
        toast.success('Product updated!');
      } else {
        await productAPI.post('/products', payload);
        toast.success('Product created!');
      }
      closeForm();
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await productAPI.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const totalImageCount = existingImages.length + images.length;

  return (
    <div className="min-h-screen pt-20 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-display font-bold">Manage Products</h1>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>

        
        {showForm && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-3xl max-h-[92vh] overflow-y-auto border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">{editing ? 'Edit Product' : 'Add New Product'}</h2>
                <button onClick={closeForm}><X className="w-5 h-5 text-gray-400 hover:text-white transition-colors" /></button>
              </div>

              <form onSubmit={handleSave}>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { label: 'Product Name',  key: 'name',  type: 'text',   span: 2 },
                    { label: 'Brand',         key: 'brand', type: 'text',   span: 1 },
                    { label: 'Model',         key: 'model', type: 'text',   span: 1 },
                    { label: 'Price (₹)',     key: 'price', type: 'number', span: 1 },
                    { label: 'Year',          key: 'year',  type: 'number', span: 1 },
                    { label: 'Color',         key: 'color', type: 'text',   span: 1 },
                    { label: 'Stock',         key: 'stock', type: 'number', span: 1 },
                  ].map(({ label, key, type, span }) => (
                    <div key={key} className={span === 2 ? 'col-span-2' : ''}>
                      <label className="block text-xs text-gray-400 mb-1">{label}</label>
                      <input
                        type={type} required
                        value={form[key]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        className="input-field py-2 text-sm"
                      />
                    </div>
                  ))}

                  {[
                    { label: 'Category',     key: 'category',     opts: ['car', 'bike'] },
                    { label: 'Fuel Type',    key: 'fuelType',     opts: ['petrol', 'diesel', 'electric', 'hybrid'] },
                    { label: 'Transmission', key: 'transmission', opts: ['manual', 'automatic'] },
                  ].map(({ label, key, opts }) => (
                    <div key={key}>
                      <label className="block text-xs text-gray-400 mb-1">{label}</label>
                      <select
                        value={form[key]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        className="input-field py-2 text-sm"
                      >
                        {opts.map((o) => (
                          <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                  ))}

                  <div className="col-span-2">
                    <label className="block text-xs text-gray-400 mb-1">Features (comma separated)</label>
                    <input
                      type="text"
                      placeholder="4WD, Sunroof, ABS, ..."
                      value={form.features}
                      onChange={(e) => setForm({ ...form, features: e.target.value })}
                      className="input-field py-2 text-sm"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs text-gray-400 mb-1">Description</label>
                    <textarea
                      required rows={3}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="input-field py-2 text-sm resize-none"
                    />
                  </div>

                  <div className="col-span-2 flex items-center gap-2">
                    <input
                      type="checkbox" id="featured"
                      checked={form.isFeatured}
                      onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                    />
                    <label htmlFor="featured" className="text-sm text-gray-300">Mark as Featured</label>
                  </div>
                </div>

                
                <div className="border-t border-gray-700 pt-5 mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-primary-light" /> Product Images
                    </h3>
                    <span className="text-xs text-gray-500">{totalImageCount}/8 images</span>
                  </div>

                  {/* Drop zone */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('admin-image-input').click()}
                    className={`border-2 border-dashed rounded-xl p-5 text-center transition-all duration-200 cursor-pointer mb-3 ${
                      dragOver
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-700 hover:border-primary/50 hover:bg-gray-800/30'
                    }`}
                  >
                    <Upload className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm font-medium">Drag & drop or click to upload</p>
                    <p className="text-gray-500 text-xs mt-1">JPG, PNG, WebP — max 10 MB each — up to 8 images</p>
                    <input
                      type="file" id="admin-image-input" multiple
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleFileInput}
                    />
                  </div>

                  
                  {existingImages.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-2">Current images (click × to remove)</p>
                      <div className="grid grid-cols-4 gap-2">
                        {existingImages.map((url, i) => (
                          <div key={i} className="relative group rounded-lg overflow-hidden aspect-video bg-gray-800">
                            <img src={url} alt={`existing-${i}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeExistingImage(i)}
                              className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3 text-white" />
                            </button>
                            {i === 0 && (
                              <div className="absolute bottom-1 left-1 bg-primary/80 text-white text-xs px-1.5 py-0.5 rounded text-[10px]">
                                Cover
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New image previews */}
                  {previews.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">New images to upload</p>
                      <div className="grid grid-cols-4 gap-2">
                        {previews.map((src, i) => (
                          <div key={i} className="relative group rounded-lg overflow-hidden aspect-video bg-gray-800">
                            <img src={src} alt={`new-${i}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeNewImage(i)}
                              className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3 text-white" />
                            </button>
                            <div className="absolute bottom-1 left-1 bg-orange-500/80 text-white text-[10px] px-1.5 py-0.5 rounded">
                              New
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {uploadingImgs && (
                    <div className="flex items-center gap-2 mt-3 text-sm text-primary-light">
                      <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                      Uploading images to Cloudinary...
                    </div>
                  )}
                </div>

                
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={saving || uploadingImgs}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60 disabled:hover:scale-100"
                  >
                    {saving ? (
                      <><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Saving...</>
                    ) : (
                      <><Check className="w-4 h-4" /> {editing ? 'Update Product' : 'Create Product'}</>
                    )}
                  </button>
                  <button type="button" onClick={closeForm} className="btn-secondary px-6">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        
        <div className="card p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  {['Image', 'Name', 'Category', 'Brand', 'Price', 'Stock', 'Featured', 'Actions'].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-gray-400 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="text-center py-8 text-gray-500">Loading...</td></tr>
                ) : products.map((p) => (
                  <tr key={p._id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="w-14 h-10 rounded-lg overflow-hidden bg-gray-800">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-gray-600" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium max-w-[160px] truncate">{p.name}</td>
                    <td className="py-3 px-4">
                      <span className="badge bg-primary/20 text-primary-light">{p.category}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-400">{p.brand}</td>
                    <td className="py-3 px-4 font-semibold">₹{Number(p.price).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4">
                      <span className={`badge ${p.stock > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="py-3 px-4">{p.isFeatured ? '⭐' : '—'}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && products.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No products yet. Click "Add Product" to get started.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
