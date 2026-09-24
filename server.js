require('dotenv').config();
const express = require('express');
const path = require('path');
// Keep these paths and letter casing exactly as written: Render runs on Linux.
const foodRoutes = require('./routes/foodRoutes.js');
const { connectRedis } = require('./config/redis.js');
const { connectMongo } = require('./config/mongo.js');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', foodRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
});

Promise.allSettled([connectRedis(), connectMongo()])
  .then((results) => {
    const failures = results.filter((result) => result.status === 'rejected');
    if (failures.length > 0) {
      const message = failures[0].reason?.message || 'Database connection failed';
      console.error('Unable to connect to required databases:', message);
      process.exit(1);
    }

    app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
  })
  .catch((error) => {
    console.error('Database startup failed:', error.message);
    process.exit(1);
  });
