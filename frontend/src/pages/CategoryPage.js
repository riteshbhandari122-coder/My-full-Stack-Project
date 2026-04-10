import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProductGrid from '../components/product/ProductGrid';
import api from '../utils/api';

const CategoryPage = () => {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    fetchCategory();
  }, [slug]);

  useEffect(() => {
    if (category) fetchProducts();
  }, [category, page]);

  const fetchCategory = async () => {
    try {
      const { data } = await api.get(`/categories/${slug}`);
      setCategory(data.category);
    } catch {}
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/products?category=${category._id}&page=${page}&limit=12`);
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
    } catch {}
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {category && (
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <span className="text-3xl">{category.icon}</span>
            {category.name}
          </h1>
          {category.description && <p className="text-gray-500 mt-1">{category.description}</p>}
          <p className="text-sm text-gray-400 mt-1">{total} products</p>
        </div>
      )}
      <ProductGrid products={products} loading={loading} cols={4} />
      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-lg font-medium ${p === page ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'}`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
