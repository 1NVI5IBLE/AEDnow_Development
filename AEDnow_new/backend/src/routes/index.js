const express = require('express');
const router = express.Router();

// Import route modules
// const userRoutes = require('./userRoutes');
// const aedRoutes = require('./aedRoutes');

// route modules
// router.use('/users', userRoutes);
// router.use('/aeds', aedRoutes);

// Example route
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to AEDnow API' });
});

module.exports = router;
