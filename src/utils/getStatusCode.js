export const getStatusCode = (error, reply) => {
  const errorMap = {
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

  const [status, message] =
    errorMap[error.code] || [500, "Something went wrong"];

  return reply.status(status).send({ error: message });
};
