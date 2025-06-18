require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const connectDB = require('../config/database');

const products = [
    {
        name: "Men's Classic Round Neck Cashmere Jumper in Grey Melange",
        price: "Rs. 88,000.00 PKR",
        image: "/assets/3.jpg",
        category: "men"
    },
    {
        name: "Men's V Neck Cashmere Argyle Jumper in Grey Blue & Navy",
        price: "Rs. 121,200.00 PKR",
        image: "/assets/4.png",
        category: "men"
    },
    {
        name: "Men's Qtr Zip Cashmere Classic Jumper In Grey Melange",
        price: "Rs. 97,000.00 PKR",
        image: "/assets/5.jpg",
        category: "men"
    },
    {
        name: "Men's Round Neck Cashmere Jumper In Grey Melange",
        price: "Rs. 130,500.00 PKR",
        image: "/assets/6.jpg",
        category: "men"
    },
    {
        name: "Round Neck Cable Knit Lambswool Jumper In Dark Natural",
        price: "Rs. 59,700.00 PKR",
        image: "/assets/13.jpg",
        category: "men"
    },
    {
        name: "Quarter Zip Lambswool Cable Knit Jumper In Dark Natural",
        price: "Rs. 69,000.00 PKR",
        image: "/assets/14.jpg",
        category: "men"
    },
    {
        name: "Men's V Neck Lambswool Argyle Jumper in Umber/natural/midnight",
        price: "Rs. 61,500.00 PKR",
        image: "/assets/15.jpg",
        category: "men"
    },
    {
        name: "V Neck Lambswool Cardigan In Dark Natural",
        price: "Rs. 54,100.00 PKR",
        image: "/assets/16.jpg",
        category: "men"
    },
    {
        name: "Womens V Neck Chunky Cashmere Jumper in Sky Blue",
        price: "Rs. 147,300.00 PKR",
        image: "/assets/8.jpg",
        category: "women"
    },
    {
        name: "Women's V Neck Chunky Cashmere Jumper in Navy Melange",
        price: "Rs. 147,300.00 PKR",
        image: "/assets/9.jpg",
        category: "women"
    },
    {
        name: "Womens Roll Neck Cashmere Jumper in Sky Blue",
        price: "Rs. 158,500.00 PKR",
        image: "/assets/10.jpg",
        category: "women"
    },
    {
        name: "Womens Cashmere Cardigan in Indigo",
        price: "Rs. 158,500.00 PKR",
        image: "/assets/11.png",
        category: "women"
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