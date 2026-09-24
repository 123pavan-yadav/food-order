const { redisClient } = require('../config/redis.js');

const sampleFoods = [
  { id: 'F101', name: 'Margherita Pizza', category: 'Italian', price: '12.99' },
  { id: 'F102', name: 'Chicken Biryani', category: 'Indian', price: '15.99' },
  { id: 'F103', name: 'Sushi Platter', category: 'Japanese', price: '24.99' }
];

function serialiseFood({ id, category, price }) {
  return `FoodID:${id},Category:${category},Price:${price}`;
}

function parseFood(name, value) {
  const details = {};
  value.split(',').filter(Boolean).forEach((part) => {
    const separator = part.indexOf(':');
    if (separator > -1) details[part.slice(0, separator)] = part.slice(separator + 1);
  });
  return {
    id: details.FoodID || '',
    name,
    category: details.Category || '',
    price: details.Price || '',
    attributes: Object.fromEntries(Object.entries(details).filter(([key]) => !['FoodID', 'Category', 'Price'].includes(key))),
    raw: value
  };
}

function requiredFoodFields(body) {
  const { id, name, category, price } = body;
  return id && name && category && price !== undefined;
}

exports.storeFood = async (req, res, next) => {
  try {
    if (!requiredFoodFields(req.body)) return res.status(400).json({ message: 'Food ID, name, category, and price are required.' });
    const food = {
      id: String(req.body.id).trim(),
      name: String(req.body.name).trim(),
      category: String(req.body.category).trim(),
      price: String(req.body.price).trim()
    };
    if (!food.id || !food.name || !food.category || !food.price) return res.status(400).json({ message: 'All food fields are required.' });
    await redisClient.set(food.name, serialiseFood(food));
    res.status(201).json({ message: 'Food Stored Successfully', food: parseFood(food.name, serialiseFood(food)) });
  } catch (error) { next(error); }
};

exports.getFood = async (req, res, next) => {
  try {
    const name = req.params.name;
    const value = await redisClient.get(name);
    if (value === null) return res.status(404).json({ message: 'Food not found.' });
    res.json({ food: parseFood(name, value) });
  } catch (error) { next(error); }
};

exports.storeSampleFoods = async (_req, res, next) => {
  try {
    const values = {};
    sampleFoods.forEach((food) => { values[food.name] = serialiseFood(food); });
    await redisClient.mSet(values);
    res.status(201).json({ message: '3 Foods Inserted Successfully', count: sampleFoods.length });
  } catch (error) { next(error); }
};

exports.appendAttribute = async (req, res, next) => {
  try {
    const { name, attribute } = req.body;
    if (!name || !attribute) return res.status(400).json({ message: 'Food name and attribute are required.' });
    const exists = await redisClient.exists(name);
    if (!exists) return res.status(404).json({ message: 'Food not found.' });
    const cleanAttribute = String(attribute).trim().replace(/^,?\s*/, '').replace(/,+$/, '');
    const value = await redisClient.append(name, `,${cleanAttribute}`);
    res.json({ message: 'Attribute appended successfully', length: value, food: parseFood(name, await redisClient.get(name)) });
  } catch (error) { next(error); }
};

exports.getLength = async (req, res, next) => {
  try {
    const name = req.params.name;
    const exists = await redisClient.exists(name);
    if (!exists) return res.status(404).json({ message: 'Food not found.' });
    res.json({ name, length: await redisClient.strLen(name) });
  } catch (error) { next(error); }
};

exports.deleteFood = async (req, res, next) => {
  try {
    const deleted = await redisClient.del(req.params.name);
    if (!deleted) return res.status(404).json({ message: 'Food not found.' });
    res.json({ message: 'Food deleted successfully' });
  } catch (error) { next(error); }
};

exports.getAllFoods = async (_req, res, next) => {
  try {
    const keys = [];
    for await (const key of redisClient.scanIterator()) keys.push(key);
    const foods = [];
    for (const key of keys) {
      const value = await redisClient.get(key);
      if (value !== null) foods.push(parseFood(key, value));
    }
    foods.sort((a, b) => a.name.localeCompare(b.name));
    res.json({ foods, count: foods.length });
  } catch (error) { next(error); }
};
