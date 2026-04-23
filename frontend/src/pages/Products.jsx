import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Car } from 'lucide-react';
import { productAPI } from '../services/api';
import VehicleCard from '../components/VehicleCard';
import LoadingSpinner from '../components/LoadingSpinner';

const DEBOUNCE_MS = 400;

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products,    setProducts]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const debounceRef = useRef(null);

  // Derive filters directly from URL search params — single source of truth
  const categoryFromURL = searchParams.get('category') || '';
  const searchFromURL   = searchParams.get('search')   || '';

  const [localSearch, setLocalSearch] = useState(searchFromURL);
  const [extraFilters, setExtraFilters] = useState({
    brand:    '',
    minPrice: '',
    maxPrice: '',
    sortBy:   'createdAt',
    order:    'desc',
  });


  const fetchProducts = useCallback(async (category, search, extra, currentPage) => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 9 };
      if (category)       params.category = category;
      if (search.trim())  params.search   = search.trim();
      if (extra.brand)    params.brand    = extra.brand;
      if (extra.minPrice) params.minPrice = extra.minPrice;
      if (extra.maxPrice) params.maxPrice = extra.maxPrice;
      params.sortBy = extra.sortBy;
      params.order  = extra.order;

      const res = await productAPI.get('/products', { params });
      setProducts(res.data.data     || []);
      setTotal(res.data.total       || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      setProducts([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, []);

  
  useEffect(() => {
    setPage(1);
    fetchProducts(categoryFromURL, localSearch, extraFilters, 1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFromURL]);   

  // Re-fetch when page changes
  useEffect(() => {
    fetchProducts(categoryFromURL, localSearch, extraFilters, page);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Search with debounce
  const handleSearchChange = (value) => {
    setLocalSearch(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchProducts(categoryFromURL, value, extraFilters, 1);
    }, DEBOUNCE_MS);
  };

  
  const handleExtraFilter = (key, value) => {
    const updated = { ...extraFilters, [key]: value };
    setExtraFilters(updated);
    setPage(1);
    fetchProducts(categoryFromURL, localSearch, updated, 1);
  };

  
  const handleSortChange = (combined) => {
    const [sortBy, order] = combined.split('_');
    const updated = { ...extraFilters, sortBy, order };
    setExtraFilters(updated);
    setPage(1);
    fetchProducts(categoryFromURL, localSearch, updated, 1);
  };


  const handleCategoryTab = (cat) => {
    setPage(1);
    setLocalSearch('');
    clearTimeout(debounceRef.current);
    if (cat) {
      setSearchParams({ category: cat });
    } else {
      setSearchParams({});
    }
  };

  
  const clearFilters = () => {
    setLocalSearch('');
    setExtraFilters({ brand: '', minPrice: '', maxPrice: '', sortBy: 'createdAt', order: 'desc' });
    setPage(1);
    setSearchParams({});
  };

  
  const pageTitle = categoryFromURL === 'car'
    ? 'Cars'
    : categoryFromURL === 'bike'
    ? 'Bikes'
    : 'All Vehicles';

  const hasActiveFilters =
    categoryFromURL || localSearch || extraFilters.brand ||
    extraFilters.minPrice || extraFilters.maxPrice;

  return (
    <div className="min-h-screen pt-20 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-8">

        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-display font-bold">{pageTitle}</h1>
            <p className="text-gray-400 mt-1">
              {loading ? 'Loading...' : `${total} vehicle${total !== 1 ? 's' : ''} found`}
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary py-2 px-4 flex items-center gap-2 text-sm ${showFilters ? 'border-primary text-primary-light' : ''}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-primary rounded-full" />
            )}
          </button>
        </div>

        
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {[
            { key: '',     label: 'All Vehicles' },
            { key: 'car',  label: '🚗 Cars' },
            { key: 'bike', label: '🏍️ Bikes' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleCategoryTab(tab.key)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap border ${
                categoryFromURL === tab.key
                  ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                  : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, brand or model..."
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="input-field pl-10 pr-10"
          />
          {localSearch && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        
        {showFilters && (
          <div className="glass p-6 mb-6 animate-fade-in">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Brand</label>
                <input
                  type="text"
                  placeholder="e.g. Honda, Toyota"
                  value={extraFilters.brand}
                  onChange={(e) => handleExtraFilter('brand', e.target.value)}
                  className="input-field py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Min Price (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={extraFilters.minPrice}
                  onChange={(e) => handleExtraFilter('minPrice', e.target.value)}
                  className="input-field py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Max Price (₹)</label>
                <input
                  type="number"
                  placeholder="Any"
                  value={extraFilters.maxPrice}
                  onChange={(e) => handleExtraFilter('maxPrice', e.target.value)}
                  className="input-field py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Sort By</label>
                <select
                  value={`${extraFilters.sortBy}_${extraFilters.order}`}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="input-field py-2 text-sm"
                >
                  <option value="createdAt_desc">Newest First</option>
                  <option value="createdAt_asc">Oldest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating_desc">Top Rated</option>
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex justify-end mt-4 pt-4 border-t border-gray-700/50">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" /> 
                </button>
              </div>
            )}
          </div>
        )}


        {loading ? (
          <div className="flex justify-center py-24">
            <LoadingSpinner size="lg" />
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((p) => (
                <VehicleCard key={p._id} product={p} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-12">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-secondary py-2 px-5 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Prev
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                          page === pageNum
                            ? 'bg-primary text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 5 && (
                    <span className="text-gray-600 px-1">...</span>
                  )}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn-secondary py-2 px-5 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24 text-gray-500">
            <Car className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-xl font-semibold mb-2 text-gray-400">No vehicles found</p>
            <p className="text-sm text-gray-600 mb-6">
              {localSearch
                ? `No results for "${localSearch}"`
                : categoryFromURL
                ? `No ${categoryFromURL}s available right now`
                : 'Try adjusting your filters'}
            </p>
            <button onClick={clearFilters} className="btn-secondary py-2 px-6 text-sm">
              Clear Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
