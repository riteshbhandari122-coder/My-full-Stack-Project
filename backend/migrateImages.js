const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');

cloudinary.config({
  cloud_name: 'daz4njvdu',
  api_key: '599422412777511',
  api_secret: 'DsdsuWrIMZLWtd6wwxzvoX0cOQQ'
});

mongoose.connect('mongodb+srv://ritesh:ritesh123456789123456789@cluster0.in6hb63.mongodb.net/shopmart');

const Product = require('./models/Product');

const migrate = async () => {
  const products = await Product.find({});
  console.log(`Migrating ${products.length} products...`);

  for (let product of products) {
    try {
      let changed = false;
      for (let i = 0; i < product.images.length; i++) {
        if (product.images[i]?.url?.includes('pinimg') || product.images[i]?.url?.includes('pinterest')) {
          const result = await cloudinary.uploader.upload(product.images[i].url, {
            folder: 'shopmart',
            timeout: 60000
          });
          product.images[i].url = result.secure_url;
          product.images[i].public_id = result.public_id;
          changed = true;
          console.log(`✅ Image ${i+1} fixed: ${product.name}`);
        }
      }
      if (changed) await product.save();
    } catch (err) {
      console.log(`❌ Failed: ${product.name} - ${err.message}`);
    }
  }
  console.log('✅ All done!');
  mongoose.disconnect();
};

migrate();