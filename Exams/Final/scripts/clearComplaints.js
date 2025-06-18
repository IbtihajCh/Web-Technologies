const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');
const connectDB = require('../config/database');

(async () => {
  await connectDB();
  await Complaint.deleteMany({});
  console.log('All complaints deleted.');
  process.exit();
})(); 