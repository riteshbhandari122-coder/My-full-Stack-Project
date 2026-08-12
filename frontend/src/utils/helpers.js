// Format currency
export const formatPrice = (price, currency = 'NPR') => {
  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: currency === 'NPR' ? 'NPR' : 'USD',
    minimumFractionDigits: 0,
  }).format(price);
};

// Format date
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };
  return new Date(date).toLocaleDateString('en-US', defaultOptions);
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Calculate discount percentage
export const calculateDiscountPercentage = (originalPrice, discountedPrice) => {
  if (!originalPrice || !discountedPrice) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};

// Generate star array for ratings
export const getStarArray = (rating) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) stars.push('full');
    else if (i - rating < 1) stars.push('half');
    else stars.push('empty');
  }
  return stars;
};

// Get order status info
export const getOrderStatusInfo = (status) => {
  const statusMap = {
    placed: { label: 'Order Placed', color: 'blue', step: 1 },
    confirmed: { label: 'Confirmed', color: 'indigo', step: 2 },
    packed: { label: 'Packed', color: 'purple', step: 3 },
    shipped: { label: 'Shipped', color: 'orange', step: 4 },
    out_for_delivery: { label: 'Out for Delivery', color: 'yellow', step: 5 },
    delivered: { label: 'Delivered', color: 'green', step: 6 },
    cancelled: { label: 'Cancelled', color: 'red', step: -1 },
    returned: { label: 'Returned', color: 'gray', step: -2 },
  };
  return statusMap[status] || { label: status, color: 'gray', step: 0 };
};

// Local storage helpers
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

// Validate email
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Get image URL with fallback
export const getImageUrl = (url, fallback = 'https://via.placeholder.com/300') => {
  if (!url) return fallback;
  if (url.startsWith('http')) return url;
  return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${url}`;
};
