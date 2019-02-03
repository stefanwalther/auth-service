
module.exports = {
  database: process.env.MONGODB_DATABASE || 'sammlerio',
  host: process.env.MONGODB_HOST || 'localhost',
  port: process.env.MONGODB_PORT || 27017,
  debug: process.env.MONGODB_DEBUG || false,

  COLLECTION_PREFIX: process.env.MONGODB_COLLECTION_PREFIX || 'auth-service~~',

  FIELD_CREATED_AT: 'createdAt',
  FIELD_UPDATED_AT: 'updatedAt',

  COLLECTION_USER: 'user',
  COLLECTION_USER_AUDIT: 'user-audit'
};
