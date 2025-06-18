const express = require('express');
const Product = require('../models/Product');
const Order = require('../models/Order');
const router = express.Router();

// Authentication middleware to protect routes
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    req.flash('error_msg', 'Please log in to access this page');
    res.redirect('/login');
};

// GET / - Home page
router.get('/', async (req, res) => {
    try {
        const menProducts = await Product.find({ category: 'men' });
        const womenProducts = await Product.find({ category: 'women' }).limit(4);
        
        res.render('index', { 
            title: 'Pringle of Scotland - Home',
            products: {
                men: menProducts,
                women: womenProducts
            }
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.render('index', { 
            title: 'Pringle of Scotland - Home',
            products: { men: [], women: [] }
        });
    }
});

// GET /products/men - Men's products page
router.get('/products/men', async (req, res) => {
    try {
        const products = await Product.find({ category: 'men' });
        res.render('products', { 
            title: 'Men\'s Collection - Pringle of Scotland',
            products: products,
            category: 'men'
        });
    } catch (error) {
        console.error('Error fetching men\'s products:', error);
        res.render('products', { 
            title: 'Men\'s Collection - Pringle of Scotland',
            products: [],
            category: 'men'
        });
    }
});

// GET /products/women - Women's products page
router.get('/products/women', async (req, res) => {
    try {
        const products = await Product.find({ category: 'women' });
        res.render('products', { 
            title: 'Women\'s Collection - Pringle of Scotland',
            products: products,
            category: 'women'
        });
    } catch (error) {
        console.error('Error fetching women\'s products:', error);
        res.render('products', { 
            title: 'Women\'s Collection - Pringle of Scotland',
            products: [],
            category: 'women'
        });
    }
});

// GET /about - About page
router.get('/about', (req, res) => {
    res.render('about', { 
        title: 'Our World - Pringle of Scotland'
    });
});

// GET /my-orders - Protected route to show user's orders
router.get('/my-orders', isAuthenticated, async (req, res) => {
    try {
        // Fetch orders for the current user, sorted by creation date (newest first)
        const orders = await Order.find({ userId: req.session.user.id })
            .sort({ createdAt: -1 })
            .populate('items.productId', 'name image');
        
        res.render('my-orders', { 
            title: 'My Orders - Pringle of Scotland',
            orders: orders
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        req.flash('error_msg', 'An error occurred while fetching your orders');
        res.redirect('/');
    }
});

module.exports = router; 