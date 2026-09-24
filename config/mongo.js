const { MongoClient } = require('mongodb');

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/food_order';
const mongoClient = new MongoClient(mongoUri, {
  serverSelectionTimeoutMS: 5000
});

function isMongoConfigured() {
  return Boolean(process.env.MONGO_URI || process.env.MONGO_HOST || process.env.MONGO_PORT);
}

async function connectMongo() {
  if (!isMongoConfigured()) {
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
