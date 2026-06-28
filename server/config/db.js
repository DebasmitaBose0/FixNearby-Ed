import mongoose from 'mongoose';
import logger from '../utils/logger.js';
import { ensureIndexes } from '../utils/dbIndexManager.js';

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      logger.warn('MONGODB_URI not set — skipping MongoDB connection (running in fallback/in-memory mode)');
      return;
    }
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    try {
      await ensureIndexes();
    } catch (indexErr) {
      logger.warn({ err: indexErr }, 'Failed to ensure indexes on startup');
    }
  } catch (error) {
    logger.error({ err: error }, 'Error connecting to MongoDB');
    logger.warn('Running without DB — controllers will use in-memory fallback');
  }
};

export default connectDB;
