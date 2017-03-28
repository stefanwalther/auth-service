const pkg = require('./../../../package.json');

const swaggerConfig = {
  swaggerDefinition: {
    info: {
      title: 'auth-service',
      version: pkg.version,
      description: pkg.description
    },
    basePath: '/',
    produces: [
      'application/json'
    ]
  },
  apis: [
    './src/api/config/swagger-definitions.js',
    './src/api/modules/api-docs/api-docs.routes.js',
    './src/api/modules/health-check/health-check.routes.js',
    './src/api/modules/user/user.routes.js'
  ]
};

module.exports = swaggerConfig;
