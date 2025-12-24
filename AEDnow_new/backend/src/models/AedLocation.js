const mongoose = require('mongoose');

const aedLocationSchema = new mongoose.Schema({
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  address: {
    type: String,
    required: false
  },
  operator: {
    type: String,
    required: false
  },
  name: {
    type: String,
    required: true
  },
  indoor: {
    type: Boolean,
    default: false
  },
  access: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: false
  },
  openingHours: {
    type: String,
    required: false
  },
  lastCheckedAt: {
    type: String,
    required: false
  }
}, {
  collection: 'aedlocations'
});

// Create a 2dsphere index for geospatial queries
aedLocationSchema.index({ location: '2dsphere' });

const AedLocation = mongoose.model('AedLocation', aedLocationSchema);

module.exports = AedLocation;
