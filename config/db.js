import mongoose from 'mongoose';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    const errorMsg = 'MONGO_URI is missing in environment variables. If deploying on Vercel, please add MONGO_URI in your Vercel Project Settings -> Environment Variables.';
    console.error(`❌ ${errorMsg}`);
    throw new Error(errorMsg);
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      console.log(`✅ MongoDB Connected: ${mongooseInstance.connection.host}`);
      return mongooseInstance;
    }).catch((err) => {
      cached.promise = null;
      console.error(`❌ MongoDB Connection Error: ${err.message}`);
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
};

export default connectDB;

