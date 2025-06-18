const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');

// Middleware to protect admin routes
const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') return next();
    req.session.error = 'You must be an admin to access this page';
    return res.redirect('/login');
};

// List all products
router.get('/products', isAdmin, async (req, res) => {
    try {
        const products = await Product.find();
        res.render('admin/products', { title: 'Admin Products', products, success: req.session.success, error: req.session.error });
        req.session.success = null;
        req.session.error = null;
    } catch (err) {
        res.render('admin/products', { title: 'Admin Products', products: [], error: 'Failed to fetch products', success: null });
    }
});

// Add product form
router.get('/products/add', isAdmin, (req, res) => {
    res.render('admin/add-product', { title: 'Add Product', error: null, success: null });
});

// Add product POST
router.post('/products/add', isAdmin, async (req, res) => {
    const { title, price, description, imageUrl, category } = req.body;
    if (!title || !price || isNaN(price) || !imageUrl || !category || !['men','women'].includes(category)) {
        return res.render('admin/add-product', { title: 'Add Product', error: 'All fields are required and must be valid.', success: null });
    }
    try {
        const product = new Product({ title, price, description, imageUrl, category });
        await product.save();
        req.session.success = 'Product added successfully';
        res.redirect('/admin/products');
    } catch (err) {
        res.render('admin/add-product', { title: 'Add Product', error: 'Failed to add product', success: null });
    }
});

// Edit product form
router.get('/products/edit/:productId', isAdmin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);
        if (!product) return res.redirect('/admin/products');
        res.render('admin/edit-product', { title: 'Edit Product', product, error: null, success: null });
    } catch (err) {
        res.redirect('/admin/products');
    }
});

// Edit product POST
router.post('/products/edit/:productId', isAdmin, async (req, res) => {
    const { title, price, description, imageUrl, category } = req.body;
    if (!title || !price || isNaN(price) || !imageUrl || !category || !['men','women'].includes(category)) {
        return res.render('admin/edit-product', { title: 'Edit Product', product: { _id: req.params.productId, title, price, description, imageUrl, category }, error: 'All fields are required and must be valid.', success: null });
    }
    try {
        await Product.findByIdAndUpdate(req.params.productId, { title, price, description, imageUrl, category });
        req.session.success = 'Product updated successfully';
        res.redirect('/admin/products');
    } catch (err) {
        res.render('admin/edit-product', { title: 'Edit Product', product: { _id: req.params.productId, title, price, description, imageUrl, category }, error: 'Failed to update product', success: null });
    }
});

// Delete product
router.post('/products/delete/:productId', isAdmin, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.productId);
        req.session.success = 'Product deleted successfully';
        res.redirect('/admin/products');
    } catch (err) {
        req.session.error = 'Failed to delete product';
        res.redirect('/admin/products');
    }
});

// List all orders
router.get('/orders', isAdmin, async (req, res) => {
    try {
        const orders = await Order.find();
        res.render('admin/orders', { title: 'Admin Orders', orders, success: req.session.success, error: req.session.error });
        req.session.success = null;
        req.session.error = null;
    } catch (err) {
        res.render('admin/orders', { title: 'Admin Orders', orders: [], error: 'Failed to fetch orders', success: null });
    }
});

// Optional: Update order status
router.post('/orders/update/:orderId', isAdmin, async (req, res) => {
    const { status } = req.body;
    try {
        await Order.findByIdAndUpdate(req.params.orderId, { status });
        req.session.success = 'Order status updated';
        res.redirect('/admin/orders');
    } catch (err) {
        req.session.error = 'Failed to update order status';
        res.redirect('/admin/orders');
    }
});

// Delete order (admin)
router.post('/orders/delete/:orderId', isAdmin, async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.orderId);
        req.session.success = 'Order deleted successfully';
        res.redirect('/admin/orders');
    } catch (err) {
        req.session.error = 'Failed to delete order';
        res.redirect('/admin/orders');
    }
});

module.exports = router; 