const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pringle-scotland');
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Sample order data
const createSampleOrders = async () => {
    try {
        // Get a user (assuming you have at least one user in the database)
        const user = await User.findOne();
        if (!user) {
            console.log('No users found. Please create a user first.');
            return;
        }

        // Get some products
        const products = await Product.find().limit(3);
        if (products.length === 0) {
            console.log('No products found. Please add some products first.');
            return;
        }

        // Sample order 1
        const order1 = new Order({
            userId: user._id,
            items: [
                {
                    productId: products[0]._id,
                    name: products[0].name,
                    price: products[0].price,
                    quantity: 2
                },
                {
                    productId: products[1]._id,
                    name: products[1].name,
                    price: products[1].price,
                    quantity: 1
                }
            ],
            totalPrice: (products[0].price * 2) + products[1].price,
            status: 'delivered',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
        });

        // Sample order 2
        const order2 = new Order({
            userId: user._id,
            items: [
                {
                    productId: products[2]._id,
                    name: products[2].name,
                    price: products[2].price,
                    quantity: 1
                }
            ],
            totalPrice: products[2].price,
            status: 'shipped',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
        });

        // Sample order 3
        const order3 = new Order({
            userId: user._id,
            items: [
                {
                    productId: products[0]._id,
                    name: products[0].name,
                    price: products[0].price,
                    quantity: 1
                },
                {
                    productId: products[1]._id,
                    name: products[1].name,
                    price: products[1].price,
                    quantity: 2
                },
                {
                    productId: products[2]._id,
                    name: products[2].name,
                    price: products[2].price,
                    quantity: 1
                }
            ],
            totalPrice: products[0].price + (products[1].price * 2) + products[2].price,
            status: 'pending',
            createdAt: new Date() // Today
        });

        // Save orders
        await Order.insertMany([order1, order2, order3]);
        
        console.log('Sample orders created successfully!');
        console.log(`Created 3 orders for user: ${user.name} (${user.email})`);
        
        // Display order details
        const orders = await Order.find({ userId: user._id }).sort({ createdAt: -1 });
        console.log('\nOrder Summary:');
        orders.forEach((order, index) => {
            console.log(`${index + 1}. Order #${order._id.toString().slice(-8).toUpperCase()} - £${order.totalPrice.toFixed(2)} - ${order.status}`);
        });

    } catch (error) {
        console.error('Error creating sample orders:', error);
    }
};

// Run the script
const run = async () => {
    await connectDB();
    await createSampleOrders();
    mongoose.connection.close();
    console.log('Script completed.');
};

run(); 