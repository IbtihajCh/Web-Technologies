const mongoose = require('mongoose');
const Product = require('../models/Product');
const connectDB = require('../config/database');

async function clearProducts() {
    await connectDB();
    const result = await Product.deleteMany({});
    console.log(`Deleted ${result.deletedCount} products.`);
    mongoose.connection.close();
}

clearProducts().catch(err => { console.error(err); mongoose.connection.close(); }); 