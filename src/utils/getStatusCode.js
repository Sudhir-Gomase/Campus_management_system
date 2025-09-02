

 const getStatusCode = (error , reply ) => {
  const ER_NO_SUCH_TABLE = 'ER_NO_SUCH_TABLE';
  const ER_BAD_REQUEST = 'ER_BAD_REQUEST';
  const ER_DUPLICATE_ENTRY = 'ER_DUP_ENTRY';
  const ER_ACCESS_DENIED = 'ER_ACCESS_DENIED';
  const ER_TIMEOUT = 'ER_TIMEOUT';
  const ER_UNSUPPORTED_MEDIA_TYPE = 'ER_UNSUPPORTED_MEDIA_TYPE';
  const ER_NOT_IMPLEMENTED = 'ER_NOT_IMPLEMENTED';
  const ER_SERVICE_UNAVAILABLE = 'ER_SERVICE_UNAVAILABLE';
  const ER_TOO_MANY_REQUESTS = 'ER_TOO_MANY_REQUESTS';
  const ER_UNAUTHORIZED = 'ER_UNAUTHORIZED';
  const ER_INVALID_OPERATION = 'ER_INVALID_OPERATION';
  const ER_INTERNAL_SERVER_ERROR = 'ER_INTERNAL_SERVER_ERROR';
  const ER_NETWORK_ERROR = 'ER_NETWORK_ERROR';
  const ER_DATA_TOO_LONG = 'ER_DATA_TOO_LONG';
  const ER_INVALID_SQL_STATEMENT = 'ER_INVALID_SQL_STATEMENT';
  const ER_INVALID_COLUMN_NAME = 'ER_INVALID_COLUMN_NAME';
  const ER_INVALID_DEFAULT = 'ER_INVALID_DEFAULT';
  const ER_INVALID_QUERY = 'ER_INVALID_QUERY';
  const ER_INVALID_VALUE = 'ER_INVALID_VALUE';
  const ER_TABLE_EXISTS = 'ER_TABLE_EXISTS';
  const exist = 'exist';

  switch (error.code) {
    case ER_NO_SUCH_TABLE:
      return reply.status(404).send('Table not found');

    case ER_BAD_REQUEST:
      return reply.status(400).send('Bad request');

    case ER_DUPLICATE_ENTRY:
      return reply.status(409).send('Duplicate entry Detected');

    case ER_ACCESS_DENIED:
      return reply.status(403).send('Access denied');

    case ER_TIMEOUT:
      return reply.status(504).send('Request timeout');

    case ER_UNSUPPORTED_MEDIA_TYPE:
      return reply.status(415).send('Unsupported media type');

    case ER_NOT_IMPLEMENTED:
      return reply.status(501).send('Not implemented');

    case ER_SERVICE_UNAVAILABLE:
      return reply.status(503).send('Service unavailable');

    case ER_TOO_MANY_REQUESTS:
      return reply.status(429).send('Too many requests');

    case ER_UNAUTHORIZED:
      return reply.status(401).send('Unauthorized');

    case ER_INVALID_OPERATION:
      return reply.status(422).send('Invalid operation');

    case ER_INTERNAL_SERVER_ERROR:
      return reply.status(500).send('Unhandled error');

    case ER_NETWORK_ERROR:
      return reply.status(502).send('Network error');

    case ER_DATA_TOO_LONG:
      return reply.status(413).send('Data too long');

    case ER_INVALID_SQL_STATEMENT:
      return reply.status(400).send('Invalid SQL statement');

    case ER_INVALID_COLUMN_NAME:
      return reply.status(400).send('Invalid column name');

    case ER_INVALID_DEFAULT:
      return reply.status(400).send('Invalid default value');

    case ER_INVALID_QUERY:
      return reply.status(400).send('Invalid query');

    case ER_INVALID_VALUE:
      return reply.status(400).send('Invalid value');

    case ER_TABLE_EXISTS:
      return reply.status(409).send('Table already exists');


    default:
      return reply.status(500).send('something went wrong');
  }
}

  ;
