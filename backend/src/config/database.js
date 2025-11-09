import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI is not defined!');
      console.error('Please set MONGODB_URI in Render Environment Variables');
      throw new Error('MONGODB_URI environment variable is not defined.');
    }

    console.log('🔄 Connecting to MongoDB...');
    console.log('📍 Connection string format check:', process.env.MONGODB_URI.substring(0, 20) + '...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed!');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.reason) {
      console.error('Error reason:', error.reason);
    }
    console.error('\n💡 Troubleshooting:');
    console.error('1. Check if MONGODB_URI is set in Render Environment Variables');
    console.error('2. Verify MongoDB Atlas allows connections from 0.0.0.0/0');
    console.error('3. Check if password has special characters (use URL encoding)');
    process.exit(1);
  }
};

export default connectDB;
