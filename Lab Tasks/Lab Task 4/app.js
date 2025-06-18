const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');
const connectDB = require('./config/database');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Import route modules
const authRoutes = require('./routes/auth');
const indexRoutes = require('./routes/index');
const cartRoutes = require('./routes/cart');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(express.static('public'));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'pringle-scotland-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production', 
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Flash messages setup
app.use(flash());

// Global variables for templates
app.use((req, res, next) => {
    if (!req.session.cart) req.session.cart = [];
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.session.user || null;
    res.locals.cart = req.session.cart;
    next();
});

// View engine setup
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('layout', 'layout');

// isAuthenticated middleware (assumed to exist elsewhere)
const isAuthenticated = (req, res, next) => {
    if (req.session.user) return next();
    req.flash('error_msg', 'Please log in to view this page');
    res.redirect('/login');
};

// isAdmin middleware
const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    req.flash('error_msg', 'You must be an admin to access this page');
    res.redirect('/login');
};

// Create hardcoded admin user if not exists
const createAdminUser = async () => {
    const adminEmail = 'admin@example.com';
    const adminPassword = 'admin123'; // Change this in production!
    try {
        let admin = await User.findOne({ email: adminEmail });
        if (!admin) {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            admin = new User({
                name: 'Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin'
            });
            await admin.save();
            console.log('Admin user created:', adminEmail);
        } else if (admin.role !== 'admin') {
            admin.role = 'admin';
            await admin.save();
            console.log('Admin user role updated:', adminEmail);
        }
    } catch (err) {
        console.error('Error creating admin user:', err);
    }
};

// Route handlers
app.use('/', indexRoutes);
app.use('/', authRoutes);
app.use('/cart', cartRoutes);
app.use('/admin', adminRoutes);
// Admin routes will be added here

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).render('error', { 
        title: 'Error - Pringle of Scotland',
        message: 'Something went wrong. Please try again later.'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', { 
        title: 'Page Not Found - Pringle of Scotland',
        message: 'The page you are looking for does not exist.'
    });
});

// Start server
const startServer = async () => {
    try {
        await connectDB();
        await createAdminUser();
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer(); 