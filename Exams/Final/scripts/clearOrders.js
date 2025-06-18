const mongoose = require('mongoose');
const Order = require('../models/Order');
const connectDB = require('../config/database');

(async () => {
  await connectDB();
  await Order.deleteMany({});
  console.log('All orders deleted.');
  process.exit();
})(); 