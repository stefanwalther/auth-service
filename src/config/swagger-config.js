const pkg = require('./../../package.json');

const swaggerConfig = {
  swaggerDefinition: {
    info: {
      title: 'auth-service',
      version: pkg.version
    }
  },
  apis: [
    './src/modules/api-docs/api-docs.routes.js',
    './src/modules/health-check/health-check.routes.js',
    './src/modules/user/user.routes.js'
  ]
};

module.exports = swaggerConfig;
