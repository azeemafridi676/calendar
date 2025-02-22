const express = require('express');
const router = express.Router();
const { testApi } = require('../controllers/productController');

router.get('/test', testApi);

module.exports = router; 