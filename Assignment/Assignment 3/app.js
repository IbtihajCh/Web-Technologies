const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');
const connectDB = require('./config/database');
const Product = require('./models/Product');
const User = require('./models/User');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));

app.use(express.static('public'));

app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('layout', 'layout');

app.use(session({
    secret: 'pringle-scotland-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

app.use(flash());

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.session.user || null;
    next();
});

app.get('/', async (req, res) => {
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

app.get('/products/men', async (req, res) => {
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

app.get('/products/women', async (req, res) => {
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

app.get('/about', (req, res) => {
    res.render('about', { 
        title: 'Our World - Pringle of Scotland'
    });
});

app.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('login', { title: 'Login - Pringle of Scotland' });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = await User.findOne({ email: email });
        
        if (!user) {
            req.flash('error_msg', 'User not found');
            return res.redirect('/login');
        }
        
        const bcrypt = require('bcryptjs');
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;
            
            if (isMatch) {
                req.session.user = {
                    id: user._id,
                    name: user.name,
                    email: user.email
                };
                req.flash('success_msg', 'You are now logged in');
                res.redirect('/');
            } else {
                req.flash('error_msg', 'Password incorrect');
                res.redirect('/login');
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        req.flash('error_msg', 'An error occurred during login');
        res.redirect('/login');
    }
});

app.get('/register', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('register', { title: 'Register - Pringle of Scotland' });
});

app.post('/register', async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
        req.flash('error_msg', 'Please fill in all fields');
        return res.redirect('/register');
    }
    
    if (password !== confirmPassword) {
        req.flash('error_msg', 'Passwords do not match');
        return res.redirect('/register');
    }
    
    if (password.length < 6) {
        req.flash('error_msg', 'Password must be at least 6 characters');
        return res.redirect('/register');
    }

    try {
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            req.flash('error_msg', 'Email is already registered');
            return res.redirect('/register');
        }

        const bcrypt = require('bcryptjs');
        bcrypt.hash(password, 10, async (err, hash) => {
            if (err) throw err;
            
            try {
                const newUser = new User({
                    name,
                    email,
                    password: hash
                });
                
                await newUser.save();
                req.flash('success_msg', 'You are now registered and can log in');
                res.redirect('/login');
            } catch (error) {
                console.error('Registration error:', error);
                req.flash('error_msg', 'An error occurred during registration');
                res.redirect('/register');
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        req.flash('error_msg', 'An error occurred during registration');
        res.redirect('/register');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) throw err;
        res.redirect('/');
    });
});

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer(); 