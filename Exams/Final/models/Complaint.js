const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    message: { type: String, required: true, trim: true },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, default: 'pending' }
});

// Add indexes for faster queries
complaintSchema.index({ userId: 1, timestamp: -1 });
complaintSchema.index({ orderId: 1 });

module.exports = mongoose.model('Complaint', complaintSchema); 