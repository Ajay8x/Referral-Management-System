import mongoose from 'mongoose';

// Disable query buffering so requests don't hang 10 seconds if disconnected
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Atlas Connection Error: ${error.message}`);
    console.log('📌 ACTION REQUIRED: Add IP "0.0.0.0/0" in MongoDB Atlas Dashboard -> Network Access -> IP Access List.');
  }
};

export default connectDB;
