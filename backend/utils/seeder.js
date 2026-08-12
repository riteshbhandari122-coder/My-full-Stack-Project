const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');

const categories = [
  { name: 'Electronics', description: 'Latest electronic gadgets and devices', icon: '📱', featured: true },
  { name: 'Fashion', description: 'Trendy clothing, shoes and accessories', icon: '👗', featured: true },
  { name: 'Home & Living', description: 'Furniture, decor and appliances', icon: '🏠', featured: true },
  { name: 'Sports & Outdoors', description: 'Sports equipment and outdoor gear', icon: '⚽', featured: true },
  { name: 'Books & Education', description: 'Books, stationery and learning materials', icon: '📚', featured: false },
  { name: 'Beauty & Health', description: 'Skincare, makeup and wellness products', icon: '💄', featured: true },
  { name: 'Groceries', description: 'Fresh food, beverages and daily essentials', icon: '🛒', featured: false },
  { name: 'Toys & Games', description: 'Toys, games and collectibles for all ages', icon: '🎮', featured: false },
  { name: 'Automotive', description: 'Car accessories and tools', icon: '🚗', featured: false },
  { name: 'Tools & Hardware', description: 'Power tools and home improvement', icon: '🔧', featured: false },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/shopmart');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@shopmart.com',
      password: 'admin123456',
      role: 'admin',
      isVerified: true,
      phone: '+977-9800000000',
    });
    console.log('👤 Admin user created: admin@shopmart.com / admin123456');

    // Create test user
    await User.create({
      name: 'Test User',
      email: 'user@shopmart.com',
      password: 'user123456',
      role: 'user',
      isVerified: true,
      phone: '+977-9811111111',
    });
    console.log('👤 Test user created: user@shopmart.com / user123456');

    // Create categories
    const createdCategories = await Category.create(categories);
    console.log(`📂 Created ${createdCategories.length} categories`);

    // Create sample products
    const products = [];
    const brands = ['Samsung', 'Apple', 'Sony', 'LG', 'Nike', 'Adidas', 'Dell', 'HP', 'Xiaomi', 'OnePlus'];

    for (let i = 1; i <= 50; i++) {
      const category = createdCategories[Math.floor(Math.random() * createdCategories.length)];
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const price = Math.floor(Math.random() * 50000) + 500;
      const discount = Math.floor(Math.random() * 40);

      products.push({
        name: `${brand} Product ${i}`,
        description: `High quality ${category.name.toLowerCase()} product from ${brand}. This is a premium product with excellent features and durability. Perfect for everyday use.`,
        shortDescription: `Premium ${brand} product - ${category.name}`,
        price,
        discountPercentage: discount,
        category: category._id,
        brand,
        images: [
          {
            url: `https://picsum.photos/seed/${i}/400/400`,
            alt: `Product ${i}`,
          },
          {
            url: `https://picsum.photos/seed/${i + 100}/400/400`,
            alt: `Product ${i} view 2`,
          },
        ],
        stock: Math.floor(Math.random() * 200) + 10,
        sold: Math.floor(Math.random() * 500),
        ratings: Math.round((Math.random() * 2 + 3) * 10) / 10,
        numReviews: Math.floor(Math.random() * 200),
        isFeatured: i <= 12,
        specifications: [
          { key: 'Brand', value: brand },
          { key: 'Category', value: category.name },
          { key: 'Warranty', value: '1 Year' },
        ],
        tags: [brand.toLowerCase(), category.name.toLowerCase(), 'shopmart'],
        seller: adminUser._id,
      });
    }

    const createdProducts = await Product.create(products);
    console.log(`📦 Created ${createdProducts.length} products`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('📌 Admin: admin@shopmart.com / admin123456');
    console.log('📌 User: user@shopmart.com / user123456');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder error:', error);
    process.exit(1);
  }
};

seedDB();
