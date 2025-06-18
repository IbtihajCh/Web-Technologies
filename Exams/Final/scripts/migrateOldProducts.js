const mongoose = require('mongoose');
const Product = require('../models/Product');
const connectDB = require('../config/database');

async function migrateOldProducts() {
    await connectDB();
    const products = await Product.find({ $or: [ { title: { $exists: false } }, { imageUrl: { $exists: false } }, { category: { $exists: false } } ] });
    let updatedCount = 0;
    for (const product of products) {
        let updated = false;
        if (!product.title && product.name) {
            product.title = product.name;
            updated = true;
        }
        if (!product.imageUrl && product.image) {
            product.imageUrl = product.image;
            updated = true;
        }
        if (!product.category) {
            product.category = 'men'; // Default to 'men', you can change this if needed
            updated = true;
        }
        if (updated) {
            await product.save();
            updatedCount++;
        }
    }
    console.log(`Migrated ${updatedCount} products.`);
    mongoose.connection.close();
}

migrateOldProducts().catch(err => { console.error(err); mongoose.connection.close(); }); 