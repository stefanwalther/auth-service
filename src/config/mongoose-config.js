
module.exports = {
  debug: process.env.MONGODB_DEBUG || false,
  host: process.env.MONGODB_HOST || 'localhost',
  port: process.env.MONGODB_PORT || 27017,
  COLLECTION_PREFIX: process.env.MONGODB_COLLECTION_PREFIX || '',
  COLLECTION_NAME: process.env.MONGODB_COLLECTION_NAME || 'auth'
};
