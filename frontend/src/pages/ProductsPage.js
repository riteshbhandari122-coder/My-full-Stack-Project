import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import ProductGrid from '../components/product/ProductGrid';
import api from '../utils/api';

// ── Moved OUTSIDE ProductsPage to prevent re-mount on every render ──

const FilterSection = ({ title, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b pb-4 mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left font-semibold text-gray-800 mb-2"
      >
        {title}
        {open ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
      </button>
      {open && children}
    </div>
  );
};

const FilterSidebar = ({ filters, categories, brands, updateFilter, clearFilters, localPrice, setLocalPrice }) => (
  <div className="bg-white rounded-xl p-5 sticky top-24">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-bold text-gray-900">Filters</h3>
      <button onClick={clearFilters} className="text-sm text-amber-600 hover:underline">Clear All</button>
    </div>

    <FilterSection title="Category">
      <div className="space-y-1">
        {categories.map((cat) => (
          <label key={cat._id} className="flex items-center gap-2 cursor-pointer hover:text-amber-600">
            <input
              type="radio"
              name="category"
              value={cat._id}
              checked={filters.category === cat._id}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="text-amber-600 focus:ring-amber-500"
            />
            <span className="text-sm">{cat.icon} {cat.name}</span>
          </label>
        ))}
      </div>
    </FilterSection>

    <FilterSection title="Price Range">
      <div className="flex gap-2">
        <input
          type="number"
          placeholder="Min"
          value={localPrice.minPrice}
          onChange={(e) => setLocalPrice(p => ({ ...p, minPrice: e.target.value }))}
          className="w-1/2 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <input
          type="number"
          placeholder="Max"
          value={localPrice.maxPrice}
          onChange={(e) => setLocalPrice(p => ({ ...p, maxPrice: e.target.value }))}
          className="w-1/2 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>
    </FilterSection>

    <FilterSection title="Brand">
      <div className="space-y-1 max-h-40 overflow-y-auto scrollbar-hide">
        {brands.slice(0, 20).map((brand) => (
          <label key={brand} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.brand.split(',').includes(brand)}
              onChange={(e) => {
                const current = filters.brand ? filters.brand.split(',') : [];
                if (e.target.checked) {
                  updateFilter('brand', [...current, brand].join(','));
                } else {
                  updateFilter('brand', current.filter((b) => b !== brand).join(','));
                }
              }}
              className="rounded text-amber-600 focus:ring-amber-500"
            />
            <span className="text-sm">{brand}</span>
          </label>
        ))}
      </div>
    </FilterSection>
  </div>
);

// ── Main Page ──

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    ratings: searchParams.get('ratings') || '',
    sort: searchParams.get('sort') || '',
    search: searchParams.get('q') || '',
  });

  // Local price state so typing is never interrupted by re-renders
  const [localPrice, setLocalPrice] = useState({
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
  });

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  // Sync search query from URL whenever navbar search changes
  useEffect(() => {
    const q = searchParams.get('q') || '';
    setFilters(prev => {
      if (prev.search === q) return prev;
      return { ...prev, search: q };
    });
    setPage(1);
  }, [searchParams.get('q')]);

  // Debounce price filter — apply 600ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        minPrice: localPrice.minPrice,
        maxPrice: localPrice.maxPrice,
      }));
      setPage(1);
    }, 600);
    return () => clearTimeout(timer);
  }, [localPrice]);

  useEffect(() => {
    fetchProducts();
    const newParams = {};
    if (filters.search) newParams.q = filters.search;
    if (filters.category) newParams.category = filters.category;
    if (filters.brand) newParams.brand = filters.brand;
    setSearchParams(newParams, { replace: true });
  }, [filters, page]);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories?parent=root');
      setCategories(data.categories || []);
    } catch (err) {
      console.error('Category Fetch Error:', err);
    }
  };

  const fetchBrands = async () => {
    try {
      const { data } = await api.get('/products/brands');
      setBrands(data.brands || []);
    } catch (err) {
      console.error('Brand Fetch Error:', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.keyword = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.brand) params.brand = filters.brand;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.ratings) params.ratings = filters.ratings;
      if (filters.sort) params.sort = filters.sort;
      params.page = page;
      params.limit = 12;

      const { data } = await api.get('/products', { params });
      const fetchedProducts = data.products || data;
      setProducts(Array.isArray(fetchedProducts) ? fetchedProducts : []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (err) {
      console.error('Product Fetch Error:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ category: '', brand: '', minPrice: '', maxPrice: '', ratings: '', sort: '', search: '' });
    setLocalPrice({ minPrice: '', maxPrice: '' });
    setPage(1);
  };

  const sortOptions = [
    { value: '', label: 'Default' },
    { value: 'newest', label: 'Newest First' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Top Rated' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
  ];

  const sidebarProps = { filters, categories, brands, updateFilter, clearFilters, localPrice, setLocalPrice };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 mt-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            {filters.search ? `Results for "${filters.search}"` : 'All Products'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{total} products found</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium"
          >
            <FiFilter size={16} /> Filters
          </button>
          <select
            value={filters.sort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {sortOptions.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="hidden md:block w-64 flex-shrink-0">
          <FilterSidebar {...sidebarProps} />
        </div>

        {showFilters && (
          <div className="fixed inset-0 z-[60] md:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-80 bg-white overflow-y-auto p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Filters</h3>
                <button onClick={() => setShowFilters(false)}>
                  <FiX size={20} />
                </button>
              </div>
              <FilterSidebar {...sidebarProps} />
            </div>
          </div>
        )}

        <div className="flex-1">
          <ProductGrid products={products} loading={loading} cols={3} />

          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={(e) => { e.currentTarget.blur(); window.scrollTo(0, 0); setPage(p); }}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    p === page ? 'bg-amber-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;