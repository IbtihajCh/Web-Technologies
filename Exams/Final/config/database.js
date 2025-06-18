require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ibtihaj:ibtihaj123@cluster1.z6hxwjg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`Database: ${conn.connection.name}`);
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        
        if (error.message.includes('ECONNREFUSED')) {
            console.log('\n🔧 Troubleshooting MongoDB Connection:');
            console.log('1. Make sure MongoDB is installed and running');
            console.log('2. For local MongoDB: Start the MongoDB service');
            console.log('3. For MongoDB Atlas: Check your connection string');
            console.log('4. Try using MongoDB Atlas (free cloud service)');
            console.log('\n📖 See MONGODB_SETUP.md for detailed instructions');
        }
        
        console.log('\n⚠️  Application will continue without database connection');
        console.log('   Products will not be available until MongoDB is connected');
    }
};

module.exports = connectDB; 