# 🛍️ ShopMart - Full-Stack E-Commerce Platform

A production-level e-commerce web application similar to Amazon, Flipkart, and Daraz with modern UI/UX, scalable architecture, and real-time features.

## 🚀 Tech Stack

**Frontend:** React.js + Tailwind CSS + Framer Motion + Zustand  
**Backend:** Node.js + Express.js + MongoDB  
**Authentication:** JWT + bcryptjs  
**Real-time:** Socket.io  
**Payment:** Stripe + Khalti + Cash on Delivery  

## 📋 Features

### Customer Features
- 🛒 Shopping cart with real-time updates
- ❤️ Wishlist management
- 🔍 Advanced search with auto-suggestions
- 📦 Order tracking with real-time timeline
- 📧 Email notifications
- ⭐ Product reviews & ratings
- 🏷️ Coupon codes & discounts
- 📱 Fully responsive (mobile-first)

### Admin Features
- 📊 Analytics dashboard with charts
- 📦 Product CRUD management
- 📋 Order management & status updates
- 👥 User management
- 🏷️ Category management
- 📉 Inventory tracking & alerts

## 🔧 Setup Instructions

### Prerequisites
- Node.js >= 16
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/shopmart
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:3000
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
STRIPE_SECRET_KEY=sk_test_xxx
```

Start the backend:
```bash
npm run dev
```

Seed the database with sample data:
```bash
npm run seed
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

## 🔑 Demo Credentials

After seeding, you can login with:
- **Admin:** admin@shopmart.com / admin123456
- **User:** user@shopmart.com / user123456

## 📁 Project Structure

```
project/
├── backend/
│   ├── controllers/     # Request handlers
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth, error handling
│   └── utils/           # Helper utilities
└── frontend/
    ├── src/
    │   ├── components/  # Reusable components
    │   ├── pages/       # Page components
    │   ├── store/       # Zustand state stores
    │   └── utils/       # API client, helpers
    └── public/
```

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get product |
| POST | `/api/cart` | Add to cart |
| GET | `/api/orders` | Get user orders |
| POST | `/api/orders` | Create order |
| GET | `/api/admin/dashboard` | Admin dashboard |

## 📄 License

MIT License - Built with ❤️ for Nepal 🇳🇵
