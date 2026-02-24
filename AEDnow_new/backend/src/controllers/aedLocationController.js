const AedLocation = require('../models/AedLocation');

const aedLocationController = {
  // GET all AED locations
  getAllLocations: async (req, res) => {
    console.log("GET ALL AED LOCATIONS HIT");
    
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
  },

  //create aed location
  createLocation: async (req, res) => {
    try {
      const {  //get data from frontend
        name,
        address,
        eircode,
        indoor,
        available,
        latitude,
        longitude
      } = req.body;
  
      //validate required fields
      if (!name || !latitude || !longitude) {
        return res.status(400).json({          //if missing return 400
          success: false,
          message: "Name, latitude and longitude are required"
        });
      }
      
      //create aed in mongodb
      const newAed = await AedLocation.create({
        name,
        address,
        eircode,
        indoor,
        available,
        location: {
          type: "Point",
          coordinates: [parseFloat(longitude), parseFloat(latitude)]
        }
      });
      ///send success response with new aed data to the frontend
      res.status(201).json({
        success: true,
        data: newAed
      });
  
    } catch (error) {
      console.error("Create error:", error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },


//update aed
  updateLocation:async (req, res) => {
    try {
      const { id } = req.params;
      const {
        name,
        address,
        eircode,
        indoor,
        available,
        latitude,
        longitude
      } = req.body;
  
      const updatedData = {
        name,
        address,
        eircode,
        indoor,
        available
      };
  
      if (latitude && longitude) {
        updatedData.location = {
          type: "Point",
          coordinates: [parseFloat(longitude), parseFloat(latitude)]
        };
      }
  
      const updatedAed = await AedLocation.findByIdAndUpdate(
        id,
        updatedData,
        { new: true }
      );
  
      if (!updatedAed) {
        return res.status(404).json({
          success: false,
          message: "AED not found"
        });
      }
  
      res.json({
        success: true,
        data: updatedAed
      });
  
    } catch (error) {
      console.error("Update error:", error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },


  //delete aed
  deleteLocation: async (req, res) => {
    try {
      const { id } = req.params;
  
      const deletedAed = await AedLocation.findByIdAndDelete(id);
  
      if (!deletedAed) {
        return res.status(404).json({
          success: false,
          message: "AED not found"
        });
      }
  
      res.json({
        success: true,
        message: "AED deleted"
      });
  
    } catch (error) {
      console.error("Delete error:", error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },


};

module.exports = aedLocationController;
