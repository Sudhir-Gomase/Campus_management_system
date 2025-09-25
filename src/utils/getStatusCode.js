export const getStatusCode = (error, reply) => {
  // Custom error messages mapping
  const customErrorMap = {
    "Company not found": [404, "Company not found"],
    "Student not found": [404, "Student not found"],
    "Admin not found": [404, "Admin not found"],
    "Department not found": [404, "Department not found"],
    "Company with this name already exists": [
      409,
      "Company with this name already exists",
    ],
    "Student already exists": [409, "Student already exists"],
    "Company not registered": [404, "Company not registered"],
    "Admin not approved yet": [403, "Admin not approved yet"],
    "Invalid username or password": [401, "Invalid username or password"],
    "Invalid email or password": [401, "Invalid email or password"],
    "Company ID is required": [400, "Company ID is required"],
    "Student ID is required": [400, "Student ID is required"],
    "No valid fields provided for update": [
      400,
      "No valid fields provided for update",
    ],
    "CTC offered cannot be negative": [400, "CTC offered cannot be negative"],
    "Invalid email format": [400, "Invalid email format"],
    "Invalid joining date format": [400, "Invalid joining date format"],
    "Company not found or no changes made": [
      404,
      "Company not found or no changes made",
    ],
    "Student ID and Company ID are required": [
      400,
      "Student ID and Company ID are required",
    ],
    "Company is not approved for placement": [
      403,
      "Company is not approved for placement",
    ],
    "Student is already placed and cannot apply to other companies": [
      409,
      "Student is already placed and cannot apply to other companies",
    ],
    "You have already applied to this company": [
      409,
      "You have already applied to this company",
    ],
    "Unauthorized access": [401, "Unauthorized access"],
    "Access denied": [403, "Access denied"],
    "Validation failed": [400, "Validation failed"],
    "Invalid data format": [400, "Invalid data format"],
    "Resource already exists": [409, "Resource already exists"],
    "Permission denied": [403, "Permission denied"],
    // Notification related errors
    "Invalid application status": [400, "Invalid application status"],
    "Custom message is required when message type is 'custom'": [
      400,
      "Custom message is required when message type is 'custom'",
    ],
    "Custom message cannot exceed 1000 characters": [
      400,
      "Custom message cannot exceed 1000 characters",
    ],
    "Template message cannot exceed 1000 characters": [
      400,
      "Template message cannot exceed 1000 characters",
    ],
    "Student IDs must be a non-empty array": [
      400,
      "Student IDs must be a non-empty array",
    ],
    "Cannot send bulk notifications to more than 100 students at once": [
      400,
      "Cannot send bulk notifications to more than 100 students at once",
    ],
    "Notification not found or access denied": [
      404,
      "Notification not found or access denied",
    ],
    "Template not found": [404, "Template not found"],
    "Bulk notification not found": [404, "Bulk notification not found"],
    "Notification ID is required": [400, "Notification ID is required"],
    "Template ID is required": [400, "Template ID is required"],
    "Bulk notification ID is required": [
      400,
      "Bulk notification ID is required",
    ],
  };

  // Database error codes mapping
  const dbErrorMap = {
    ER_NO_SUCH_TABLE: [404, "Table not found"],
    ER_BAD_REQUEST: [400, "Bad request"],
    ER_DUP_ENTRY: [409, "Duplicate entry detected"],
    ER_ACCESS_DENIED: [403, "Access denied"],
    ER_TIMEOUT: [504, "Request timeout"],
    ER_UNSUPPORTED_MEDIA_TYPE: [415, "Unsupported media type"],
    ER_NOT_IMPLEMENTED: [501, "Not implemented"],
    ER_SERVICE_UNAVAILABLE: [503, "Service unavailable"],
    ER_TOO_MANY_REQUESTS: [429, "Too many requests"],
    ER_UNAUTHORIZED: [401, "Unauthorized"],
    ER_INVALID_OPERATION: [422, "Invalid operation"],
    ER_INTERNAL_SERVER_ERROR: [500, "Unhandled error"],
    ER_NETWORK_ERROR: [502, "Network error"],
    ER_DATA_TOO_LONG: [413, "Data too long"],
    ER_INVALID_SQL_STATEMENT: [400, "Invalid SQL statement"],
    ER_INVALID_COLUMN_NAME: [400, "Invalid column name"],
    ER_INVALID_DEFAULT: [400, "Invalid default value"],
    ER_INVALID_QUERY: [400, "Invalid query"],
    ER_INVALID_VALUE: [400, "Invalid value"],
    ER_TABLE_EXISTS: [409, "Table already exists"],
  };

  let status, message;

  // First check if it's a custom error message
  if (error.message && customErrorMap[error.message]) {
    [status, message] = customErrorMap[error.message];
  }
  // Check for eligibility criteria errors
  else if (
    error.message &&
    error.message.includes("Eligibility criteria not met")
  ) {
    status = 422;
    message = error.message;
  }
  // Check for MySQL date errors
  else if (error.message && error.message.includes("Incorrect date value")) {
    status = 400;
    message = "Invalid date format provided";
  }
  // Then check if it's a database error code
  else if (error.code && dbErrorMap[error.code]) {
    [status, message] = dbErrorMap[error.code];
  }
  // Default fallback
  else {
    status = 500;
    message = error.message || "Something went wrong";
  }

  // Consistent error response structure
  return reply.status(status).send({
    success: false,
    error: message,
  });
};
