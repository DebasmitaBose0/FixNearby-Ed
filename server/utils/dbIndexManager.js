import mongoose from 'mongoose';
import logger from './logger.js';

const INDEX_OPERATIONS = {
  background: true,
};

export async function ensureIndexes() {
  const db = mongoose.connection.db;
  if (!db) {
    logger.warn('No database connection available for index management');
    return;
  }

  const collections = await db.listCollections().toArray();
  const collectionNames = collections.map(c => c.name);

  logger.info('Starting database index verification...');

  for (const modelName of mongoose.modelNames()) {
    const model = mongoose.model(modelName);
    const collectionName = model.collection.name;

    if (!collectionNames.includes(collectionName)) {
      logger.warn(`Collection ${collectionName} does not exist yet, skipping`);
      continue;
    }

    try {
      await model.createIndexes();
      logger.info(`Indexes ensured for ${collectionName}`);
    } catch (err) {
      logger.error({ err }, `Failed to ensure indexes for ${collectionName}`);
    }
  }

  logger.info('Database index verification complete');
}

export async function getIndexReport() {
  const db = mongoose.connection.db;
  if (!db) {
    return { error: 'No database connection' };
  }

  const report = {};

  for (const modelName of mongoose.modelNames()) {
    const model = mongoose.model(modelName);
    const collectionName = model.collection.name;

    try {
      const indexes = await model.collection.indexes();
      report[collectionName] = indexes.map(idx => ({
        name: idx.name,
        key: idx.key,
        unique: !!idx.unique,
        sparse: !!idx.sparse,
        background: !!idx.background
      }));
    } catch (err) {
      report[collectionName] = { error: err.message };
    }
  }

  return report;
}
