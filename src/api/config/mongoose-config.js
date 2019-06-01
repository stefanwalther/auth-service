
module.exports = {
  connection_string: process.env.MONGODB_CONNECTION_STRING,
  database: process.env.MONGODB_DATABASE || 'auth-service',
  host: process.env.MONGODB_HOST || 'localhost',
  port: process.env.MONGODB_PORT || 27017,
  debug: process.env.MONGODB_DEBUG || false,

  COLLECTION_PREFIX: process.env.MONGODB_COLLECTION_PREFIX || 'auth-service~~',

  FIELD_CREATED_AT: 'createdAt',
  FIELD_UPDATED_AT: 'updatedAt',

  COLLECTION_USER: 'users',
  COLLECTION_USER_AUDIT: 'user-audit'
};
