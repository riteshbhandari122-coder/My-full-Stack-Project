const mongoose = require('mongoose');
const Product = require('./models/Product');

async function fixIds() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/your_database_name');
  
  const products = await Product.find({});
  for (let p of products) {
    const idStr = p._id.toString();
    if (idStr.startsWith('ObjectId')) {
      const realHex = idStr.match(/'([^']+)'/)[1];
      await mongoose.connection.collection('products').deleteOne({ _id: p._id });
      p._id = new mongoose.Types.ObjectId(realHex);
      await mongoose.connection.collection('products').insertOne(p.toObject ? p.toObject() : p);
      console.log(`Fixed ID for: ${p.name}`);
    }
  }
  console.log('All IDs cleaned!');
  process.exit(0);
}

fixIds();