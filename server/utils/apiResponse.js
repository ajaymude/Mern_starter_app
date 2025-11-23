/**
 * Standardized API response utility
 * Ensures consistent response format across all endpoints
 */

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
export const sendSuccess = (res, data = null, message = "Success", statusCode = 200) => {
  res.status(statusCode).json({
    status: "success",
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 400)
 * @param {*} errors - Additional error details
 */
export const sendError = (res, message = "An error occurred", statusCode = 400, errors = null) => {
  const response = {
    status: "error",
    message,
    timestamp: new Date().toISOString(),
  };

  if (errors) {
    response.errors = errors;
  }

  res.status(statusCode).json(response);
};

/**
 * Send paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Array of data items
 * @param {Object} pagination - Pagination metadata
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
export const sendPaginated = (
  res,
  data,
  pagination,
  message = "Success",
  statusCode = 200
) => {
  res.status(statusCode).json({
    status: "success",
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      pages: Math.ceil(pagination.total / pagination.limit),
    },
    timestamp: new Date().toISOString(),
  });
};

