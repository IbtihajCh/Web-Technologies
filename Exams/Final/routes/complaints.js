const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const Order = require('../models/Order');
const mongoose = require('mongoose');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session.user) return next();
    req.flash('error_msg', 'Please log in to access this page');
    res.redirect('/login');
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') return next();
    req.flash('error_msg', 'You must be an admin to access this page');
    res.redirect('/login');
};

// GET /contact - Contact Us page
router.get('/contact', isAuthenticated, async (req, res) => {
    try {
        const userIdRaw = req.session.user && (req.session.user._id || req.session.user.id);
        const userIdStr = typeof userIdRaw === 'object' && userIdRaw.toString ? userIdRaw.toString() : userIdRaw;
        const orders = await Order.find({ userId: userIdStr }).sort({ createdAt: -1 });
        res.render('contact', {
            title: 'Contact Us',
            orders: orders,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error loading contact page:', error);
        req.flash('error_msg', 'Error loading contact page');
        res.redirect('/');
    }
});

// POST /complaints - Submit new complaint
router.post('/complaints', isAuthenticated, async (req, res) => {
    try {
        const { orderId, message } = req.body;
        if (!orderId || !message) {
            req.flash('error_msg', 'Please fill in all required fields');
            return res.redirect('/contact');
        }
        const userIdRaw = req.session.user && (req.session.user._id || req.session.user.id);
        const userIdObj = new mongoose.Types.ObjectId(userIdRaw);
        // Validate order belongs to user
        const order = await Order.findOne({ _id: orderId, userId: userIdRaw.toString() });
        if (!order) {
            req.flash('error_msg', 'Invalid order ID');
            return res.redirect('/contact');
        }
        const complaint = new Complaint({
            userId: userIdObj,
            orderId: new mongoose.Types.ObjectId(orderId),
            message: message.trim()
        });
        await complaint.save();
        req.flash('success_msg', 'Your complaint has been submitted successfully');
        res.redirect('/complaints');
    } catch (error) {
        console.error('Error submitting complaint:', error);
        req.flash('error_msg', 'Error submitting complaint');
        res.redirect('/contact');
    }
});

// GET /complaints - User's complaints
router.get('/complaints', isAuthenticated, async (req, res) => {
    try {
        const userIdRaw = req.session.user && (req.session.user._id || req.session.user.id);
        const userIdObj = new mongoose.Types.ObjectId(userIdRaw);
        const complaints = await Complaint.find({ userId: userIdObj })
            .populate('orderId')
            .sort({ timestamp: -1 });
        res.render('complaints', {
            title: 'My Complaints',
            complaints: complaints,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error loading complaints:', error);
        req.flash('error_msg', 'Error loading complaints');
        res.redirect('/');
    }
});

// GET /admin/complaints - Admin view all complaints
router.get('/admin/complaints', isAdmin, async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .populate('userId', 'name email')
            .populate('orderId')
            .sort({ timestamp: -1 });
        res.render('admin/complaints', {
            title: 'Manage Complaints',
            complaints: complaints,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error loading admin complaints:', error);
        req.flash('error_msg', 'Error loading complaints');
        res.redirect('/admin');
    }
});

// POST /admin/complaints/:id/status - Update complaint status (admin only)
router.post('/admin/complaints/:id/status', isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const complaint = await Complaint.findById(req.params.id);
        
        if (!complaint) {
            req.flash('error_msg', 'Complaint not found');
            return res.redirect('/admin/complaints');
        }

        complaint.status = status;
        await complaint.save();
        
        req.flash('success_msg', 'Complaint status updated successfully');
        res.redirect('/admin/complaints');
    } catch (error) {
        console.error('Error updating complaint status:', error);
        req.flash('error_msg', 'Error updating complaint status');
        res.redirect('/admin/complaints');
    }
});

module.exports = router; 