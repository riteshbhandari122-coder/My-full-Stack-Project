const mongoose = require('mongoose');

const specificationSchema = new mongoose.Schema({
  key: { type: String, required: true },
  value: { type: String, required: true },
});

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  public_id: { type: String, default: '' },
  alt: { type: String, default: '' },
  color: { type: String, default: '' }, // ← ADDED
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, unique: true, index: true },
    description: { type: String, required: true },
    shortDescription: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
    discountedPrice: { type: Number, default: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    subcategory: { type: String, default: '' },
    brand: { type: String, required: true, index: true },
    images: [imageSchema],
    stock: { type: Number, required: true, min: 0, default: 0 },
    sold: { type: Number, default: 0 },
    specifications: [specificationSchema],
    tags: [{ type: String }],
    ratings: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    weight: { type: Number, default: 0 },
    dimensions: { length: Number, width: Number, height: Number },
    sku: { type: String, unique: true, sparse: true },
    views: { type: Number, default: 0 },
    colors: [{ type: String }],
    sizes: [{ type: String }],
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deliveryInfo: { type: String, default: 'Standard delivery 3-5 business days' },
    returnPolicy: { type: String, default: '30-day return policy' },
    warranty: { type: String, default: '1 year manufacturer warranty' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });
productSchema.index({ price: 1 });
productSchema.index({ ratings: -1 });
productSchema.index({ createdAt: -1 });

productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
});

productSchema.pre('save', function (next) {
  if (this.discountPercentage > 0) {
    this.discountedPrice = Math.round(this.price - (this.price * this.discountPercentage) / 100);
  } else {
    this.discountedPrice = this.price;
  }
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Date.now();
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);