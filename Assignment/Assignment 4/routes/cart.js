const express = require('express');
const Product = require('../models/Product');
const Order = require('../models/Order');
const router = express.Router();

// Authentication middleware to protect checkout routes
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    req.flash('error_msg', 'Please log in to access this page');
    res.redirect('/login');
};

// Initialize cart in session if it doesn't exist
const initializeCart = (req, res, next) => {
    if (!req.session.cart) {
        req.session.cart = [];
    }
    next();
};

// POST /cart/add/:productId - Add product to cart
router.post('/add/:productId', initializeCart, async (req, res) => {
    // Ensure user is logged in before adding to cart
    if (!req.session.user) {
        req.flash('error_msg', 'Please log in to add items to your cart.');
        return res.redirect('/login');
    }

    try {
        const productId = req.params.productId;
        const quantity = parseInt(req.body.quantity) || 1;
        const size = req.body.size;

        // Validate quantity and size
        if (quantity <= 0) {
            req.flash('error_msg', 'Quantity must be greater than 0');
            return res.redirect('back');
        }
        if (!size) {
            req.flash('error_msg', 'Please select a size');
            return res.redirect('back');
        }

        // Fetch product details from database
        const product = await Product.findById(productId);
        if (!product) {
            req.flash('error_msg', 'Product not found');
            return res.redirect('back');
        }

        // Check if product with same size already exists in cart
        const existingItemIndex = req.session.cart.findIndex(
            item => item.productId.toString() === productId && item.size === size
        );

        if (existingItemIndex > -1) {
            // Update quantity if product+size already exists
            req.session.cart[existingItemIndex].quantity += quantity;
        } else {
            // Add new product to cart
            req.session.cart.push({
                productId: product._id,
                name: product.name,
                price: parseFloat(product.price),
                size: size,
                quantity: quantity,
                image: product.image // Store image for cart display
            });
        }

        req.flash('success_msg', 'Product added to cart successfully');
        res.redirect('/cart');
    } catch (error) {
        console.error('Error adding product to cart:', error);
        req.flash('error_msg', 'An error occurred while adding product to cart');
        res.redirect('back');
    }
});

// GET /cart - View cart contents (show empty cart message if needed)
router.get('/', initializeCart, (req, res) => {
    const cart = req.session.cart || [];
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    res.render('cart', {
        title: 'Shopping Cart - Pringle of Scotland',
        cart,
        total,
        isEmpty: cart.length === 0
    });
});

// POST /cart/update - Update cart quantities or remove items
router.post('/update', initializeCart, (req, res) => {
    try {
        const cart = req.session.cart;
        const updates = req.body;

        // Process each item update
        Object.keys(updates).forEach(key => {
            if (key.startsWith('quantity_')) {
                const productId = key.replace('quantity_', '');
                const newQuantity = parseInt(updates[key]);

                const itemIndex = cart.findIndex(item => item.productId.toString() === productId);
                
                if (itemIndex > -1) {
                    if (newQuantity <= 0) {
                        // Remove item if quantity is 0 or negative
                        cart.splice(itemIndex, 1);
                    } else {
                        // Update quantity
                        cart[itemIndex].quantity = newQuantity;
                    }
                }
            }
        });

        req.flash('success_msg', 'Cart updated successfully');
        res.redirect('/cart');
    } catch (error) {
        console.error('Error updating cart:', error);
        req.flash('error_msg', 'An error occurred while updating cart');
        res.redirect('/cart');
    }
});

// POST /cart/remove/:productId - Remove specific item from cart
router.post('/remove/:productId', initializeCart, (req, res) => {
    try {
        const productId = req.params.productId;
        const cart = req.session.cart;

        const itemIndex = cart.findIndex(item => item.productId.toString() === productId);
        
        if (itemIndex > -1) {
            cart.splice(itemIndex, 1);
            req.flash('success_msg', 'Item removed from cart');
        } else {
            req.flash('error_msg', 'Item not found in cart');
        }

        res.redirect('/cart');
    } catch (error) {
        console.error('Error removing item from cart:', error);
        req.flash('error_msg', 'An error occurred while removing item');
        res.redirect('/cart');
    }
});

// GET /checkout - Checkout page (protected route)
router.get('/checkout', isAuthenticated, initializeCart, (req, res) => {
    const cart = req.session.cart || [];
    
    if (cart.length === 0) {
        req.flash('error_msg', 'Your cart is empty');
        return res.redirect('/cart');
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.render('checkout', {
        title: 'Checkout - Pringle of Scotland',
        cart: cart,
        total: total,
        user: req.session.user
    });
});

// POST /cart/checkout - Place order
router.post('/checkout', isAuthenticated, initializeCart, async (req, res) => {
    try {
        const cart = req.session.cart || [];
        if (cart.length === 0) {
            req.flash('error_msg', 'Your cart is empty');
            return res.redirect('/cart');
        }

        const { email, fullName, address, phone, paymentMethod, cardNumber, cardExpiry, cardCVV, nameOnCard } = req.body;

        // Server-side validation
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            req.flash('error_msg', 'Please enter a valid email address.');
            return res.redirect('/cart/checkout');
        }
        if (!fullName || !/^[A-Za-z ]+$/.test(fullName)) {
            req.flash('error_msg', 'Please enter your full name (alphabets and spaces only).');
            return res.redirect('/cart/checkout');
        }
        if (!address || address.trim().length < 5) {
            req.flash('error_msg', 'Please enter a valid address (at least 5 characters).');
            return res.redirect('/cart/checkout');
        }
        if (!phone || !/^\d{10,12}$/.test(phone)) {
            req.flash('error_msg', 'Please enter a valid phone number (10-12 digits).');
            return res.redirect('/cart/checkout');
        }
        if (!paymentMethod || !['cod', 'card'].includes(paymentMethod)) {
            req.flash('error_msg', 'Please select a valid payment method.');
            return res.redirect('/cart/checkout');
        }

        if (paymentMethod === 'card') {
            if (!cardNumber || !/^\d{16}$/.test(cardNumber)) {
                req.flash('error_msg', 'Please enter a valid 16-digit card number.');
                return res.redirect('/cart/checkout');
            }
            if (!cardExpiry || !/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(cardExpiry)) {
                req.flash('error_msg', 'Please enter a valid expiry date (MM/YY).');
                return res.redirect('/cart/checkout');
            } else {
                const [month, year] = cardExpiry.split('/').map(Number);
                const currentYear = new Date().getFullYear() % 100;
                const currentMonth = new Date().getMonth() + 1;
                if (year < currentYear || (year === currentYear && month < currentMonth)) {
                    req.flash('error_msg', 'Expiry Date must be in the future.');
                    return res.redirect('/cart/checkout');
                }
            }
            if (!cardCVV || !/^\d{3}$/.test(cardCVV)) {
                req.flash('error_msg', 'Please enter a valid 3-digit CVV.');
                return res.redirect('/cart/checkout');
            }
            // nameOnCard is optional as per new design
        }

        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const order = new Order({
            userId: req.session.user.id,
            items: cart,
            totalPrice,
            email,
            name: fullName, // Map fullName to name in Order model
            phone,
            address,
            paymentMethod: paymentMethod === 'card' ? 'Credit/Debit Card' : 'Cash on Delivery',
            cardLast4: paymentMethod === 'card' ? cardNumber.slice(-4) : undefined,
            nameOnCard: paymentMethod === 'card' ? nameOnCard : undefined, // Save name on card if applicable
            status: 'pending',
            createdAt: new Date()
        });
        await order.save();

        req.session.cart = [];
        req.flash('success_msg', 'Order placed successfully! You can view your order in My Orders.');
        res.redirect('/my-orders');
    } catch (error) {
        console.error('Order placement error:', error);
        req.flash('error_msg', 'An error occurred while placing your order. Please try again.');
        res.redirect('/cart/checkout');
    }
});

module.exports = router; 