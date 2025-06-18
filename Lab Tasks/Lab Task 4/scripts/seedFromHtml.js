const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const connectDB = require('../config/database');

// Helper to parse price string like 'Rs. 88,000.00 PKR' to number
function parsePrice(priceStr) {
    // Extract numeric part and divide by 100 to get original price (e.g., 8800000 -> 88000)
    return parseInt(priceStr.replace(/[^0-9]/g, '')) / 100;
}

// Helper to extract products from HTML
function extractProductsFromHtml(html) {
    const products = [];
    // Extract from products-section (men/women)
    const sectionRegex = /<section class="products-section">([\s\S]*?)<\/section>/g;
    let match;
    while ((match = sectionRegex.exec(html)) !== null) {
        const section = match[1];
        let category = 'men';
        if (/Women/i.test(section)) category = 'women';
        const cardRegex = /<div class="product-card">([\s\S]*?)<\/div>/g;
        let cardMatch;
        while ((cardMatch = cardRegex.exec(section)) !== null) {
            const card = cardMatch[1];
            const imgMatch = card.match(/<img[^>]+src="([^"]+)"[^>]*>/);
            let imageUrl = imgMatch ? imgMatch[1].trim() : '';
            if (imageUrl && !imageUrl.startsWith('/assets/')) {
                imageUrl = '/assets/' + imageUrl.replace(/^assets\//, '').replace(/^\//, '');
            }
            const titleMatch = card.match(/<h3 class="product-title">([^<]+)<\/h3>/);
            const title = titleMatch ? titleMatch[1].trim() : '';
            const priceMatch = card.match(/<p class="product-price">([^<]+)<\/p>/);
            const price = priceMatch ? parsePrice(priceMatch[1]) : 0;
            const description = title;
            const sizes = ['XS', 'S', 'M', 'L', 'XL'];
            if (title && imageUrl && price) {
                products.push({ title, imageUrl, price, category, description, sizes });
            }
        }
    }
    // Extract from essential-section (always men)
    const essentialRegex = /<section class="essential-section">([\s\S]*?)<\/section>/g;
    let essentialMatch;
    while ((essentialMatch = essentialRegex.exec(html)) !== null) {
        const section = essentialMatch[1];
        const category = 'men';
        const cardRegex = /<div class="product-card">([\s\S]*?)<\/div>/g;
        let cardMatch;
        while ((cardMatch = cardRegex.exec(section)) !== null) {
            const card = cardMatch[1];
            const imgMatch = card.match(/<img[^>]+src="([^"]+)"[^>]*>/);
            let imageUrl = imgMatch ? imgMatch[1].trim() : '';
            if (imageUrl && !imageUrl.startsWith('/assets/')) {
                imageUrl = '/assets/' + imageUrl.replace(/^assets\//, '').replace(/^\//, '');
            }
            const titleMatch = card.match(/<h3 class="product-title">([^<]+)<\/h3>/);
            const title = titleMatch ? titleMatch[1].trim() : '';
            const priceMatch = card.match(/<p class="product-price">([^<]+)<\/p>/);
            const price = priceMatch ? parsePrice(priceMatch[1]) : 0;
            const description = title;
            const sizes = ['XS', 'S', 'M', 'L', 'XL'];
            if (title && imageUrl && price) {
                products.push({ title, imageUrl, price, category, description, sizes });
            }
        }
    }
    return products;
}

async function seedProducts() {
    await connectDB();
    const html = fs.readFileSync(path.join(__dirname, '../index2.html'), 'utf8');
    const products = extractProductsFromHtml(html);
    console.log('Extracted products:', products);
    if (!products.length) {
        console.log('No products found in HTML.');
        return mongoose.connection.close();
    }
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log(`Seeded ${products.length} products from HTML.`);
    mongoose.connection.close();
}

seedProducts().catch(err => { console.error(err); mongoose.connection.close(); }); 