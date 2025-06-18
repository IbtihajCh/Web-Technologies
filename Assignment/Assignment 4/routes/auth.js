const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// Middleware to check if user is already logged in
const redirectIfAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    next();
};

// GET /login - Show login form
router.get('/login', redirectIfAuthenticated, (req, res) => {
    res.render('login', { title: 'Login - Pringle of Scotland' });
});

// POST /login - Handle login form submission
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
        req.flash('error_msg', 'Please provide both email and password');
        return res.redirect('/login');
    }
    
    try {
        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user) {
            req.flash('error_msg', 'Invalid email or password');
            return res.redirect('/login');
        }
        
        // Compare password with hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (isMatch) {
            // Store user info in session
            req.session.user = {
                id: user._id,
                name: user.name,
                email: user.email
            };
            req.flash('success_msg', 'Welcome back! You are now logged in');
            res.redirect('/');
        } else {
            req.flash('error_msg', 'Invalid email or password');
            res.redirect('/login');
        }
    } catch (error) {
        console.error('Login error:', error);
        req.flash('error_msg', 'An error occurred during login. Please try again.');
        res.redirect('/login');
    }
});

// GET /register - Show registration form
router.get('/register', redirectIfAuthenticated, (req, res) => {
    res.render('register', { title: 'Register - Pringle of Scotland' });
});

// POST /register - Handle registration form submission
router.post('/register', async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    // Validate input
    if (!name || !email || !password || !confirmPassword) {
        req.flash('error_msg', 'Please fill in all fields');
        return res.redirect('/register');
    }
    
    if (password !== confirmPassword) {
        req.flash('error_msg', 'Passwords do not match');
        return res.redirect('/register');
    }
    
    if (password.length < 6) {
        req.flash('error_msg', 'Password must be at least 6 characters long');
        return res.redirect('/register');
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            req.flash('error_msg', 'Email is already registered');
            return res.redirect('/register');
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Create new user
        const newUser = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword
        });
        
        await newUser.save();
        req.flash('success_msg', 'Registration successful! You can now log in');
        res.redirect('/login');
    } catch (error) {
        console.error('Registration error:', error);
        req.flash('error_msg', 'An error occurred during registration. Please try again.');
        res.redirect('/register');
    }
});

// GET /logout - Handle user logout
router.get('/logout', (req, res) => {
    // Set flash message before destroying the session
    req.flash('success_msg', 'You have been successfully logged out');
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            // If session destruction fails, the flash message might not persist.
            // We'll rely on the initial flash message or handle it on the redirect target if needed.
            return res.redirect('/'); // Redirect to home on session destroy error
        }
        res.redirect('/login'); // Redirect to login page after session is destroyed
    });
});

module.exports = router; 