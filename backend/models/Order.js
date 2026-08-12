const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  color: { type: String, default: '' },
  size: { type: String, default: '' },
});

const trackingEventSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
    required: true,
  },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  location: { type: String, default: '' },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderNumber: { type: String, unique: true },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      enum: ['stripe', 'khalti', 'esewa', 'cod'],
      required: true,
    },
    paymentResult: {
      id: String,
      status: String,
      updateTime: String,
      emailAddress: String,
    },
    itemsPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    taxPrice: { type: Number, required: true, default: 0.0 },
    discountAmount: { type: Number, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },
    couponCode: { type: String, default: '' },
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    status: {
      type: String,
      enum: ['placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
      default: 'placed',
    },
    trackingHistory: [trackingEventSchema],
    trackingNumber: { type: String, default: '' },
    deliveredAt: Date,
    cancelledAt: Date,
    cancelReason: { type: String, default: '' },
    notes: { type: String, default: '' },
    invoiceUrl: { type: String, default: '' },
    estimatedDelivery: Date,
  },
  { timestamps: true }
);

// Generate order number before save
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `SM${timestamp}${random}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
