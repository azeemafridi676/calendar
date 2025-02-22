const express = require('express');
const router = express.Router();
const { getAuthUrl, getEvents, handleCallback } = require('../controllers/calendarController');

router.get('/auth', getAuthUrl);
router.get('/callback', handleCallback);
router.get('/events', getEvents);

module.exports = router; 