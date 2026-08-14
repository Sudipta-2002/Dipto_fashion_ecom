import mongoose from 'mongoose';
import dns from 'dns';

import Order from '../models/Order.js';

// Configure reliable DNS servers to resolve MongoDB Atlas SRV (_mongodb._tcp) records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4', '1.0.0.1']);
} catch (dnsErr) {
  console.warn('Could not set custom DNS servers:', dnsErr.message);
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    });
    console.log(`MongoDB Connected: ${conn.connection.host} / Database: ${conn.connection.name}`);
    if (Order && Order.syncOrderIndexes) {
      Order.syncOrderIndexes();
    }
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Failed: ${error.message}`);
    console.log('Falling back to local in-memory/mock storage if Atlas is unreachable.');
    throw error;
  }
};

export default connectDB;

