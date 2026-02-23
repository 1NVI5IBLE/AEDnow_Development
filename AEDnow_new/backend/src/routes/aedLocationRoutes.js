const authMiddleware = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const aedLocationController = require('../controllers/aedLocationController');

// GET all AED locations
router.get('/', aedLocationController.getAllLocations);

// GET single AED location by ID
router.get('/:id', aedLocationController.getLocationById);

// GET nearby AED locations
router.get('/nearby', aedLocationController.getNearbyLocations);

//new routes
router.post('/', authMiddleware, aedLocationController.createLocation);
router.put('/:id', authMiddleware, aedLocationController.updateLocation);
router.delete('/:id', authMiddleware, aedLocationController.deleteLocation);

module.exports = router;
