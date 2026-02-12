const express = require('express');
const router = express.Router();

// Import route modules
const aedLocationRoutes = require('./aedLocationRoutes');
const adminRoutes = require('./admin');

// Use route modules
router.use('/aedlocations', aedLocationRoutes);
router.use('/admin', adminRoutes);

// Example route
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to AEDnow API' });
});

module.exports = router;
