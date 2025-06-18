const mongoose = require('mongoose');
const Product = require('../models/Product');
const connectDB = require('../config/database');
const axios = require('axios');

async function fetchImageBuffer(url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data, 'binary');
    } catch (err) {
        console.error('Failed to fetch image:', url);
        return null;
    }
}

async function bulkFixProducts() {
    await connectDB();
    const products = await Product.find({ name: { $exists: true }, image: { $exists: true } });
    let updatedCount = 0;
    for (const product of products) {
        let updated = false;
        if (product.name) {
            product.title = product.name;
            updated = true;
        }
        if (product.image) {
            product.imageUrl = product.image;
            // Store image as Buffer in imageData
            if (!product.imageData) {
                const buffer = await fetchImageBuffer(product.image);
                if (buffer) {
                    product.imageData = buffer;
                }
            }
            updated = true;
        }
        if (updated) {
            await product.save();
            updatedCount++;
        }
    }
    console.log(`Bulk fixed ${updatedCount} products.`);
    mongoose.connection.close();
}

bulkFixProducts().catch(err => { console.error(err); mongoose.connection.close(); }); 