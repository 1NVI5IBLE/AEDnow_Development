// Utility helper functions

const helpers = {
  // Format date
  formatDate: (date) => {
    return new Date(date).toISOString();
  },

  // Validate email
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Generate random string
  generateRandomString: (length = 10) => {
    return Math.random().toString(36).substring(2, length + 2);
  },

  // Error response formatter
  errorResponse: (message, statusCode = 500) => {
    return {
      error: true,
      message,
      statusCode
    };
  },

  // Success response formatter
  successResponse: (data, message = 'Success') => {
    return {
      success: true,
      message,
      data
    };
  }
};

module.exports = helpers;
