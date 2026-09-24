const express = require('express');
const controller = require('../controllers/foodController.js');

const router = express.Router();

router.get('/foods', controller.getAllFoods);
router.post('/foods', controller.storeSampleFoods);
router.post('/food', controller.storeFood);
router.get('/food/:name', controller.getFood);
router.delete('/food/:name', controller.deleteFood);
router.post('/append', controller.appendAttribute);
router.get('/length/:name', controller.getLength);

module.exports = router;
