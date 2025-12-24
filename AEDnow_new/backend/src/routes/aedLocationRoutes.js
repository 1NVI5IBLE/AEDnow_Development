const express = require('express');
const router = express.Router();
const aedLocationController = require('../controllers/aedLocationController');

// GET all AED locations
router.get('/', aedLocationController.getAllLocations);

// GET single AED location by ID
router.get('/:id', aedLocationController.getLocationById);

// GET nearby AED locations
router.get('/nearby', aedLocationController.getNearbyLocations);

module.exports = router;
