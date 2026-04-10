import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiHeart, FiShoppingCart, FiStar, FiTruck, FiShield,
  FiRotateCcw, FiShare2, FiChevronLeft, FiChevronRight
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
  const [activeTab, setActiveTab] = useState('description');
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => { fetchProduct(); }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      // Try by slug first, fall back to ID
      let data;
      try {
        const res = await api.get(`/products/slug/${id}`);
        data = res.data;
      } catch {
        const res = await api.get(`/products/${id}`);
        data = res.data;
      }
      setProduct(data.product);
      setSelectedColor(data.product.colors?.[0] || '');
      setSelectedSize(data.product.sizes?.[0] || '');

      const [relatedRes, reviewsRes] = await Promise.all([
        api.get(`/products/${data.product._id}/related`),
        api.get(`/reviews/product/${data.product._id}`),
      ]);
      setRelated(relatedRes.data.products);
      setReviews(reviewsRes.data.reviews);
    } catch {
      toast.error('Product not found');
    }
    setLoading(false);
  };

  // ✅ When color changes, find the matching image index
  const handleColorChange = (color) => {
    setSelectedColor(color);
    if (product?.images?.length > 0) {
      const colorImageIndex = product.images.findIndex(
        (img) => img.color?.toLowerCase() === color.toLowerCase()
      );
      // If a matching image found, switch to it. Otherwise stay on first image.
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
      toast.error(err.message);
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

  if (!product) return null;

  const inWishlist = isInWishlist(product._id);
  const images = product.images || [];
  const price = product.discountedPrice || product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-primary-600">Products</Link>
        <span>/</span>
        <Link to={`/category/${product.category?.slug}`} className="hover:text-primary-600">{product.category?.name}</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Images */}
        <div>
          <div className="relative bg-white rounded-xl overflow-hidden aspect-square mb-3 border">
            <img
              src={images[selectedImage]?.url || 'https://picsum.photos/600/600'}
              alt={images[selectedImage]?.alt || product.name}
              className="w-full h-full object-contain p-4"
            />
            {product.discountPercentage > 0 && (
              <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-2 py-1 rounded">
                -{product.discountPercentage}%
              </span>
            )}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage((prev) => Math.max(0, prev - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white shadow rounded-full flex items-center justify-center"
                >
                  <FiChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setSelectedImage((prev) => Math.min(images.length - 1, prev + 1))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white shadow rounded-full flex items-center justify-center"
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
                  i === selectedImage ? 'border-primary-500' : 'border-gray-200'
                }`}
              >
                <img src={img.url} alt={img.alt || ''} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-sm text-primary-600 font-medium uppercase tracking-wide mb-1">{product.brand}</p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map((s) => (
                <FiStar key={s} size={16} className={s <= Math.round(product.ratings) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
              ))}
            </div>
            <span className="text-sm font-medium text-gray-700">{product.ratings}</span>
            <span className="text-sm text-gray-500">({product.numReviews} reviews)</span>
            <span className={`text-sm font-medium px-2 py-0.5 rounded ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
            </span>
          </div>

          {/* Price */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
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

          {/* ✅ Colors - now switches image on click */}
          {product.colors?.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Color: <span className="text-primary-600">{selectedColor}</span>
              </p>
              <div className="flex gap-2 flex-wrap">
                {product.colors.map((c) => {
                  // Check if this color has a matching image
                  const hasImage = product.images?.some(
                    (img) => img.color?.toLowerCase() === c.toLowerCase()
                  );
                  return (
                    <button
                      key={c}
                      onClick={() => handleColorChange(c)}
                      title={c}
                      className={`relative w-10 h-10 rounded-full border-4 transition-all ${
                        selectedColor === c
                          ? 'border-primary-600 scale-110 shadow-md'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: c.toLowerCase() }}
                    >
                      {/* Small image preview badge if image exists */}
                      {hasImage && selectedColor === c && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary-600 rounded-full border-2 border-white" />
                      )}
                    </button>
                  );
                })}
              </div>
              {/* ✅ Show current color image label */}
              {images[selectedImage]?.color && (
                <p className="text-xs text-gray-500 mt-2">
                  Showing: <span className="font-medium">{images[selectedImage].color}</span> variant
                </p>
              )}
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
                        ? 'border-primary-600 bg-primary-50 text-primary-600'
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
              <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 text-lg font-bold">+</button>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiShoppingCart size={18} />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button
              onClick={handleWishlist}
              className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-colors ${
                inWishlist ? 'border-red-500 bg-red-50 text-red-500' : 'border-gray-300 text-gray-600 hover:border-red-400'
              }`}
            >
              <FiHeart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
            </button>
            <button className="w-12 h-12 rounded-lg border-2 border-gray-300 text-gray-600 flex items-center justify-center hover:border-gray-400">
              <FiShare2 size={18} />
            </button>
          </div>

          {/* Delivery Info */}
          <div className="border rounded-xl p-4 space-y-3">
            {[
              { icon: FiTruck, text: product.deliveryInfo || 'Standard delivery 3-5 business days' },
              { icon: FiRotateCcw, text: product.returnPolicy || '30-day return policy' },
              { icon: FiShield, text: product.warranty || '1 year manufacturer warranty' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-gray-600">
                <Icon size={16} className="text-primary-600 flex-shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl mb-8">
        <div className="flex border-b overflow-x-auto">
          {['description', 'specifications', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 font-semibold text-sm capitalize whitespace-nowrap transition-colors ${
                activeTab === tab ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab} {tab === 'reviews' && `(${reviews.length})`}
            </button>
          ))}
        </div>

        <div className="p-6">
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
                          <FiStar size={24} className={s <= reviewForm.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Review title"
                    value={reviewForm.title}
                    onChange={e => setReviewForm(p => ({...p, title: e.target.value}))}
                    className="input-field mb-3"
                    required
                  />
                  <textarea
                    placeholder="Share your experience..."
                    value={reviewForm.comment}
                    onChange={e => setReviewForm(p => ({...p, comment: e.target.value}))}
                    className="input-field mb-3 h-24 resize-none"
                    required
                  />
                  <button type="submit" disabled={submittingReview} className="btn-primary">
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
                          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                            {review.user?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{review.user?.name}</p>
                            <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <FiStar key={s} size={14} className={s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                          ))}
                        </div>
                      </div>
                      <p className="font-medium text-gray-800 text-sm mb-1">{review.title}</p>
                      <p className="text-gray-600 text-sm">{review.comment}</p>
                      {review.isVerifiedPurchase && (
                        <span className="inline-block mt-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">✓ Verified Purchase</span>
                      )}
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
          <h2 className="text-xl font-bold text-gray-900 mb-4">Related Products</h2>
          <ProductGrid products={related} loading={false} cols={4} />
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;