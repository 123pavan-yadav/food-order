const { MongoClient } = require('mongodb');

const isRenderEnvironment = Boolean(process.env.RENDER || process.env.RENDER_EXTERNAL_URL || process.env.RENDER_SERVICE_NAME);
const shouldUseLocalMongoFallback = !isRenderEnvironment && process.env.NODE_ENV !== 'production';

const mongoUri = process.env.MONGO_URI || (shouldUseLocalMongoFallback ? 'mongodb://127.0.0.1:27017/food_order' : null);
const mongoClient = mongoUri ? new MongoClient(mongoUri, {
  serverSelectionTimeoutMS: 5000
}) : null;

function isMongoConfigured() {
  return Boolean(process.env.MONGO_URI || process.env.MONGO_HOST || process.env.MONGO_PORT || (shouldUseLocalMongoFallback && !isRenderEnvironment));
}

async function connectMongo() {
  if (!isMongoConfigured() || !mongoClient) {
    console.log('MongoDB not configured, skipping connection.');
    return null;
  }

  if (!mongoClient.topology || !mongoClient.topology.isConnected()) {
    await mongoClient.connect();
    console.log('Connected to MongoDB');
  }

  return mongoClient.db(process.env.MONGO_DB_NAME || 'food_order');
}

module.exports = { mongoClient, connectMongo, isMongoConfigured };
