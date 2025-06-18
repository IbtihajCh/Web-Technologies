const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    items: { type: Array, required: true },
    totalPrice: { type: Number, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    paymentMethod: { type: String, enum: ['Cash on Delivery', 'Credit/Debit Card'], required: true },
    cardNumber: { type: String, required: function() { return this.paymentMethod === 'Credit/Debit Card'; } },
    cardLast4: { type: String, required: false },
    nameOnCard: { type: String, required: false },
    status: { type: String, default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema); 