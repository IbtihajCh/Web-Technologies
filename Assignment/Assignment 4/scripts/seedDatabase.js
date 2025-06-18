require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const connectDB = require('../config/database');

const products = [
    {
        name: "Men's Classic Round Neck Cashmere Jumper in Grey Melange",
        price: "88000",
        image: "/assets/3.jpg",
        category: "men",
        description: "A timeless classic round neck cashmere jumper in grey melange. Extremely soft, warm, and stylish.",
        sizes: ["XS", "S", "M", "L", "XL"]
    },
    {
        name: "Men's V Neck Cashmere Argyle Jumper in Grey Blue & Navy",
        price: "121200",
        image: "/assets/4.png",
        category: "men",
        description: "V neck cashmere argyle jumper in grey blue and navy. Perfect for layering and comfort.",
        sizes: ["XS", "S", "M", "L", "XL"]
    },
    {
        name: "Men's Qtr Zip Cashmere Classic Jumper In Grey Melange",
        price: "97000",
        image: "/assets/5.jpg",
        category: "men",
        description: "Quarter zip cashmere jumper in classic grey melange. Warm, soft, and versatile.",
        sizes: ["XS", "S", "M", "L", "XL"]
    },
    {
        name: "Men's Round Neck Cashmere Jumper In Grey Melange",
        price: "130500",
        image: "/assets/6.jpg",
        category: "men",
        description: "Round neck cashmere jumper in grey melange. A wardrobe essential for every man.",
        sizes: ["XS", "S", "M", "L", "XL"]
    },
    {
        name: "Round Neck Cable Knit Lambswool Jumper In Dark Natural",
        price: "59700",
        image: "/assets/13.jpg",
        category: "men",
        description: "Cable knit lambswool jumper in dark natural. Classic style and warmth.",
        sizes: ["XS", "S", "M", "L", "XL"]
    },
    {
        name: "Quarter Zip Lambswool Cable Knit Jumper In Dark Natural",
        price: "69000",
        image: "/assets/14.jpg",
        category: "men",
        description: "Quarter zip lambswool cable knit jumper in dark natural. Stylish and comfortable.",
        sizes: ["XS", "S", "M", "L", "XL"]
    },
    {
        name: "Men's V Neck Lambswool Argyle Jumper in Umber/natural/midnight",
        price: "61500",
        image: "/assets/15.jpg",
        category: "men",
        description: "V neck lambswool argyle jumper in umber, natural, and midnight colors.",
        sizes: ["XS", "S", "M", "L", "XL"]
    },
    {
        name: "V Neck Lambswool Cardigan In Dark Natural",
        price: "54100",
        image: "/assets/16.jpg",
        category: "men",
        description: "V neck lambswool cardigan in dark natural. Perfect for layering.",
        sizes: ["XS", "S", "M", "L", "XL"]
    },
    {
        name: "Womens V Neck Chunky Cashmere Jumper in Sky Blue",
        price: "147300",
        image: "/assets/8.jpg",
        category: "women",
        description: "Women's v neck chunky cashmere jumper in sky blue. Soft, warm, and fashionable.",
        sizes: ["XS", "S", "M", "L", "XL"]
    },
    {
        name: "Women's V Neck Chunky Cashmere Jumper in Navy Melange",
        price: "147300",
        image: "/assets/9.jpg",
        category: "women",
        description: "Women's v neck chunky cashmere jumper in navy melange. Elegant and cozy.",
        sizes: ["XS", "S", "M", "L", "XL"]
    },
    {
        name: "Womens Roll Neck Cashmere Jumper in Sky Blue",
        price: "158500",
        image: "/assets/10.jpg",
        category: "women",
        description: "Women's roll neck cashmere jumper in sky blue. Ultimate comfort and style.",
        sizes: ["XS", "S", "M", "L", "XL"]
    },
    {
        name: "Womens Cashmere Cardigan in Indigo",
        price: "158500",
        image: "/assets/11.png",
        category: "women",
        description: "Women's cashmere cardigan in indigo. Luxurious and versatile.",
        sizes: ["XS", "S", "M", "L", "XL"]
    }
];

const seedDatabase = async () => {
    try {
        await connectDB();
        
        if (mongoose.connection.readyState !== 1) {
            console.error('❌ MongoDB is not connected. Please check your setup.');
            console.log('📖 See MONGODB_SETUP.md for detailed instructions');
            process.exit(1);
        }
        
        await Product.deleteMany({});
        console.log('✅ Cleared existing products');
        
        const insertedProducts = await Product.insertMany(products);
        console.log(`✅ Successfully inserted ${insertedProducts.length} products`);
        
        mongoose.connection.close();
        console.log('🎉 Database seeding completed successfully!');
    } catch (error) {
        console.error('❌ Error seeding database:', error.message);
        console.log('📖 See MONGODB_SETUP.md for troubleshooting');
        process.exit(1);
    }
};

seedDatabase(); 