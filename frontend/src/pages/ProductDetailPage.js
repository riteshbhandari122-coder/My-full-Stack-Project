import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FiHeart, FiShoppingCart, FiStar, FiTruck, FiShield,
  FiShare2, FiChevronLeft, FiChevronRight,
  FiCheckCircle, FiFeather, FiGlobe, FiAward
} from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import ProductGrid from '../components/product/ProductGrid';
import api from '../utils/api';
import { formatPrice, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [activeTab, setActiveTab] = useState('eco-impact');
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => { 
    if (id) fetchProduct(); 
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      // The backend's GET /api/products/:id already resolves both a slug
      // (e.g. "biodegradable-bamboo-toothbrush") and a raw ObjectId in one
      // query — no need for a separate /products/slug/:id call, which
      // doesn't exist as a route and was causing false "not found" results.
      const res = await api.get(`/products/${id}`);
      const data = res.data;

      const fetchedProduct = data?.product || data;
      if (!fetchedProduct) {
        throw new Error('Product not found');
      }

      setProduct(fetchedProduct);
      setSelectedColor(fetchedProduct.colors?.[0] || '');
      setSelectedSize(fetchedProduct.sizes?.[0] || '');

      const [relatedRes, reviewsRes] = await Promise.all([
        api.get(`/products/${fetchedProduct._id}/related`).catch(() => ({ data: { products: [] } })),
        api.get(`/reviews/product/${fetchedProduct._id}`).catch(() => ({ data: { reviews: [] } })),
      ]);
      setRelated(relatedRes.data.products || []);
      setReviews(reviewsRes.data.reviews || []);
    } catch (error) {
      toast.error('Product not found');
      setProduct(null);
    }
    setLoading(false);
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
    if (product?.images?.length > 0) {
      let colorImageIndex = product.images.findIndex(
        (img) => img.color?.toLowerCase() === color.toLowerCase()
      );
      if (colorImageIndex === -1) {
        colorImageIndex = product.images.findIndex(
          (img) => img.alt?.toLowerCase().includes(color.toLowerCase())
        );
      }
      setSelectedImage(colorImageIndex >= 0 ? colorImageIndex : 0);
    }
  };

  const handleAddToCart = async () => {
    if (!user) { toast.error('Please login to add to cart'); return; }
    await addToCart(product._id, quantity, selectedColor, selectedSize);
  };

  const handleWishlist = async () => {
    if (!user) { toast.error('Please login'); return; }
    await toggleWishlist(product._id);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to review'); return; }
    setSubmittingReview(true);
    try {
      await api.post('/reviews', { productId: product._id, ...reviewForm });
      toast.success('Review submitted!');
      setReviewForm({ rating: 5, title: '', comment: '' });
      const { data } = await api.get(`/reviews/product/${product._id}`);
      setReviews(data.reviews);
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    }
    setSubmittingReview(false);
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square bg-gray-200 rounded-xl" />
        <div className="space-y-4">
          {[1,2,3,4].map(i => <div key={i} className="h-6 bg-gray-200 rounded" />)}
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
      <p className="text-gray-500 mb-6">The product you are looking for might have been removed or is temporarily unavailable.</p>
      <Link to="/products" className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-emerald-700">
        Back to Products
      </Link>
    </div>
  );

  const inWishlist = isInWishlist(product._id);
  const images = product.images || [];
  const price = product.discountedPrice || product.price;

  const ecoData = product.ecoImpact || {
    score: product.ecoScore || 'A+',
    plasticSavedGrams: product.plasticSaved || 45,
    co2SavedKg: product.co2Saved || 1.2,
    waterSavedLiters: product.waterSaved || 18,
    comparisonTarget: 'Standard Synthetic Alternative',
    certifiedPartner: product.partnerName || 'Eco-Enterprises Nepal Pvt. Ltd.',
    govRegistrationNo: product.panNumber || 'PAN 609823411 (Govt. Registered)',
    highlights: [
      '100% Biodegradable / Ethically Sourced',
      'Zero Single-Use Plastic Packaging',
      'Handcrafted by Local Nepalese Artisans'
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-emerald-600">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-emerald-600">Products</Link>
        <span>/</span>
        {product.category?.slug && (
          <>
            <Link to={`/category/${product.category.slug}`} className="hover:text-emerald-600">{product.category?.name}</Link>
            <span>/</span>
          </>
        )}
        <span className="text-gray-800 font-medium line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Images */}
        <div>
          <div className="relative bg-white rounded-xl overflow-hidden aspect-square mb-3 border border-gray-100 shadow-sm">
            <img
              src={images[selectedImage]?.url || 'https://picsum.photos/600/600'}
              alt={images[selectedImage]?.alt || product.name}
              className="w-full h-full object-contain p-4"
            />
            
            <span className="absolute top-4 right-4 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
              <FiFeather size={14} /> Eco Grade {ecoData.score}
            </span>

            {product.discountPercentage > 0 && (
              <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-2.5 py-1 rounded-md">
                -{product.discountPercentage}%
              </span>
            )}
            
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage((prev) => Math.max(0, prev - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 shadow rounded-full flex items-center justify-center hover:bg-white"
                >
                  <FiChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setSelectedImage((prev) => Math.min(images.length - 1, prev + 1))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 shadow rounded-full flex items-center justify-center hover:bg-white"
                >
                  <FiChevronRight size={16} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          <div className="flex gap-2 overflow-x-auto">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden transition-all ${
                  i === selectedImage ? 'border-emerald-600 ring-2 ring-emerald-100' : 'border-gray-200'
                }`}
              >
                <img src={img.url} alt={img.alt || ''} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info Side */}
        <div>
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-200 mb-2">
            <FiCheckCircle className="text-emerald-600" size={14} />
            <span>Govt Registered Local Partner: <strong>{ecoData.certifiedPartner}</strong></span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map((s) => (
                <FiStar key={s} size={16} className={s <= Math.round(product.ratings || 5) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
              ))}
            </div>
            <span className="text-sm font-medium text-gray-700">{product.ratings || 5.0}</span>
            <span className="text-sm text-gray-500">({product.numReviews || reviews.length} reviews)</span>
            <span className={`text-sm font-medium px-2 py-0.5 rounded ${product.stock > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'}`}>
              {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
            </span>
          </div>

          {/* Price */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-gray-900">{formatPrice(price)}</span>
              {product.discountPercentage > 0 && (
                <>
                  <span className="text-lg text-gray-400 line-through">{formatPrice(product.price)}</span>
                  <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded">
                    Save {product.discountPercentage}%
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Eco Impact Highlights Card */}
          <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/60 rounded-xl p-4 mb-5 border border-emerald-200/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <FiGlobe size={14} className="text-emerald-600" /> Sustainability Impact
              </span>
              <span className="text-xs text-emerald-700 font-medium">vs. {ecoData.comparisonTarget}</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center mb-3">
              <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-100 shadow-2xs">
                <span className="text-lg font-black text-emerald-700 block">{ecoData.plasticSavedGrams}g</span>
                <span className="text-[11px] text-gray-600">Plastic Saved</span>
              </div>
              <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-100 shadow-2xs">
                <span className="text-lg font-black text-emerald-700 block">{ecoData.co2SavedKg}kg</span>
                <span className="text-[11px] text-gray-600">CO₂ Offset</span>
              </div>
              <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-100 shadow-2xs">
                <span className="text-lg font-black text-emerald-700 block">{ecoData.waterSavedLiters}L</span>
                <span className="text-[11px] text-gray-600">Water Saved</span>
              </div>
            </div>

            <ul className="space-y-1 text-xs text-emerald-900">
              {ecoData.highlights.map((h, idx) => (
                <li key={idx} className="flex items-center gap-1.5">
                  <FiCheckCircle className="text-emerald-600 flex-shrink-0" size={12} />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Colors */}
          {product.colors?.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Color: <span className="text-emerald-600">{selectedColor}</span>
              </p>
              <div className="flex gap-2 flex-wrap">
                {product.colors.map((c) => {
                  const colorMap = {
                    white: '#ffffff', black: '#000000', red: '#ef4444', blue: '#3b82f6',
                    green: '#22c55e', yellow: '#eab308', pink: '#ec4899', purple: '#a855f7',
                    orange: '#f97316', gray: '#6b7280', grey: '#6b7280', brown: '#92400e',
                    navy: '#1e3a5f', gold: '#f59e0b', silver: '#9ca3af',
                  };
                  const bgColor = colorMap[c.toLowerCase()] || c.toLowerCase();
                  const isLight = ['white', 'yellow', 'silver', 'gold'].includes(c.toLowerCase());

                  return (
                    <button
                      key={c}
                      onClick={() => handleColorChange(c)}
                      title={c}
                      className={`relative w-9 h-9 rounded-full border-2 transition-all ${
                        selectedColor === c
                          ? 'border-emerald-600 scale-110 shadow-md ring-2 ring-emerald-200'
                          : isLight ? 'border-gray-400' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: bgColor }}
                    >
                      {selectedColor === c && (
                        <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Size: {selectedSize}</p>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-colors ${
                      selectedSize === s
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-bold'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Actions */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 text-lg font-bold">−</button>
              <span className="w-12 text-center font-semibold">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stock || 1, quantity + 1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 text-lg font-bold">+</button>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all"
            >
              <FiShoppingCart size={18} />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button
              onClick={handleWishlist}
              className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-colors ${
                inWishlist ? 'border-red-500 bg-red-50 text-red-500' : 'border-gray-300 text-gray-600 hover:border-red-400'
              }`}
            >
              <FiHeart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
            </button>
            <button className="w-12 h-12 rounded-xl border-2 border-gray-300 text-gray-600 flex items-center justify-center hover:border-gray-400">
              <FiShare2 size={18} />
            </button>
          </div>

          {/* Local Partner & Delivery Guarantees */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-white">
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <FiAward size={18} className="text-emerald-600 flex-shrink-0" />
              <span>Verified Business ID: <strong>{ecoData.govRegistrationNo}</strong></span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <FiTruck size={18} className="text-emerald-600 flex-shrink-0" />
              <span>{product.deliveryInfo || 'Carbon-neutral delivery within Nepal (2-4 business days)'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <FiShield size={18} className="text-emerald-600 flex-shrink-0" />
              <span>100% Eco-Authenticity Guarantee with local partner return support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-white rounded-xl mb-8 border border-gray-100 shadow-xs">
        <div className="flex border-b overflow-x-auto">
          {['eco-impact', 'description', 'specifications', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 font-semibold text-sm capitalize whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === tab 
                  ? 'border-b-2 border-emerald-600 text-emerald-700 bg-emerald-50/50' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'eco-impact' && <FiFeather size={16} className="text-emerald-600" />}
              {tab.replace('-', ' ')} {tab === 'reviews' && `(${reviews.length})`}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'eco-impact' && (
            <div className="space-y-6">
              <div className="border-l-4 border-emerald-600 pl-4 py-1">
                <h3 className="text-lg font-bold text-gray-900">Why choosing this product matters</h3>
                <p className="text-sm text-gray-600 mt-1">
                  EcoMart verifies each product's ecological footprint in direct comparison with conventional non-eco equivalents.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="py-3 px-4 font-semibold text-gray-700">Environmental Metric</th>
                      <th className="py-3 px-4 font-semibold text-emerald-700 bg-emerald-50/80">EcoMart Product</th>
                      <th className="py-3 px-4 font-semibold text-gray-500">Standard Alternative</th>
                      <th className="py-3 px-4 font-semibold text-emerald-800">Net Direct Benefit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="py-3 px-4 font-medium text-gray-800">Single-Use Plastic Content</td>
                      <td className="py-3 px-4 text-emerald-700 font-bold bg-emerald-50/30">0 grams</td>
                      <td className="py-3 px-4 text-gray-600">{ecoData.plasticSavedGrams} grams</td>
                      <td className="py-3 px-4 text-emerald-800 font-bold">100% Plastic Free</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-gray-800">CO₂ Manufacturing Footprint</td>
                      <td className="py-3 px-4 text-emerald-700 font-bold bg-emerald-50/30">Low (Local Sourcing)</td>
                      <td className="py-3 px-4 text-gray-600">High (Imported Synthetic)</td>
                      <td className="py-3 px-4 text-emerald-800 font-bold">Saves ~{ecoData.co2SavedKg}kg CO₂</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-gray-800">Sourcing & Labor</td>
                      <td className="py-3 px-4 text-emerald-700 font-bold bg-emerald-50/30">Govt Reg. Nepal Partner</td>
                      <td className="py-3 px-4 text-gray-600">Unverified Mass Factory</td>
                      <td className="py-3 px-4 text-emerald-800 font-bold">Supports Local Economy</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'description' && (
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {product.specifications?.map((spec) => (
                <div key={spec.key} className="flex items-center gap-2 py-2 border-b last:border-0">
                  <span className="text-sm font-semibold text-gray-600 w-32 flex-shrink-0">{spec.key}:</span>
                  <span className="text-sm text-gray-800">{spec.value}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              {user && (
                <form onSubmit={handleSubmitReview} className="bg-gray-50 rounded-xl p-5 mb-6">
                  <h3 className="font-bold text-gray-900 mb-4">Write a Review</h3>
                  <div className="mb-3">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Rating</label>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map((s) => (
                        <button key={s} type="button" onClick={() => setReviewForm(p => ({...p, rating: s}))}>
                          <FiStar size={24} className={s <= reviewForm.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Review title"
                    value={reviewForm.title}
                    onChange={e => setReviewForm(p => ({...p, title: e.target.value}))}
                    className="w-full px-4 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <textarea
                    placeholder="Share your experience with this eco product..."
                    value={reviewForm.comment}
                    onChange={e => setReviewForm(p => ({...p, comment: e.target.value}))}
                    className="w-full px-4 py-2 border rounded-lg mb-3 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <button type="submit" disabled={submittingReview} className="bg-emerald-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}
              {reviews.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="border rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                            {review.user?.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{review.user?.name}</p>
                            <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <FiStar key={s} size={14} className={s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
                          ))}
                        </div>
                      </div>
                      <p className="font-medium text-gray-800 text-sm mb-1">{review.title}</p>
                      <p className="text-gray-600 text-sm">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Related Eco Products</h2>
          <ProductGrid products={related} loading={false} cols={4} />
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;