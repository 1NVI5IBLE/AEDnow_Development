const AedLocation = require('../models/AedLocation');

const aedLocationController = {
  // GET all AED locations
  getAllLocations: async (req, res) => {
    try {
      const aedLocations = await AedLocation.find({});
      
      // Transforms data to frontend-friendly format
      const formattedLocations = aedLocations.map(aed => ({
        id: aed._id.toString(),
        name: aed.name,
        latitude: aed.location.coordinates[1], // GeoJSON: [longitude, latitude]
        longitude: aed.location.coordinates[0],
        address: aed.address,
        operator: aed.operator,
        indoor: aed.indoor,
        access: aed.access,
        description: aed.description,
        openingHours: aed.openingHours,
        lastCheckedAt: aed.lastCheckedAt
      }));

      res.status(200).json({
        success: true,
        count: formattedLocations.length,
        data: formattedLocations
      });
    } catch (error) {
      console.error('Error fetching AED locations:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // GET single AED location by ID
  getLocationById: async (req, res) => {
    try {
      const { id } = req.params;
      const aedLocation = await AedLocation.findById(id);

      if (!aedLocation) {
        return res.status(404).json({
          success: false,
          error: 'AED location not found'
        });
      }

      const formattedLocation = {
        id: aedLocation._id.toString(),
        name: aedLocation.name,
        latitude: aedLocation.location.coordinates[1],
        longitude: aedLocation.location.coordinates[0],
        address: aedLocation.address,
        operator: aedLocation.operator,
        indoor: aedLocation.indoor,
        access: aedLocation.access,
        description: aedLocation.description,
        openingHours: aedLocation.openingHours,
        lastCheckedAt: aedLocation.lastCheckedAt
      };

      res.status(200).json({
        success: true,
        data: formattedLocation
      });
    } catch (error) {
      console.error('Error fetching AED location:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // GET nearby AED locations (optional - for future use)
  getNearbyLocations: async (req, res) => {
    try {
      const { latitude, longitude, maxDistance = 5000 } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          error: 'Latitude and longitude are required'
        });
      }

      const aedLocations = await AedLocation.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            $maxDistance: parseInt(maxDistance)
          }
        }
      });

      const formattedLocations = aedLocations.map(aed => ({
        id: aed._id.toString(),
        name: aed.name,
        latitude: aed.location.coordinates[1],
        longitude: aed.location.coordinates[0],
        address: aed.address,
        operator: aed.operator,
        indoor: aed.indoor,
        access: aed.access,
        description: aed.description,
        openingHours: aed.openingHours,
        lastCheckedAt: aed.lastCheckedAt
      }));

      res.status(200).json({
        success: true,
        count: formattedLocations.length,
        data: formattedLocations
      });
    } catch (error) {
      console.error('Error fetching nearby AED locations:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

module.exports = aedLocationController;
