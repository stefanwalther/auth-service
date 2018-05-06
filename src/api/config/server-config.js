module.exports = {
  PORT: process.env.PORT || 3010,
  env: {
    NODE_ENV: process.env.NODE_ENV || 'development'
  },
  AUDIT_LOG: process.env.AUDIT_LOG === 'true'
};
