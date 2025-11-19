// Database configuration
// MongoDB, PostgreSQL, or other databases

const dbConfig = {
  development: {
    url: process.env.DATABASE_URL || 'your_dev_database_url',
    options: {
      
    }
  },
  production: {
    url: process.env.DATABASE_URL,
    options: {
      
    }
  }
};

const env = process.env.NODE_ENV || 'development';

module.exports = dbConfig[env];
