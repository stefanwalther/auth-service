const pkg = require('read-pkg-up').sync().pkg;

const swaggerConfig = {
  swaggerDefinition: {
    info: {
      title: pkg.name,
      version: pkg.version,
      description: pkg.description
    },
    basePath: '/',
    produces: [
      'application/json'
    ]
  },
  // Todo: make this dynamic
  apis: [
    './src/api/config/swagger-definitions.js',
    './src/api/modules/api-docs/api-docs.routes.js',
    './src/api/modules/health-check/health-check.routes.js',
    './src/api/modules/user/user.routes.js'
  ]
};

module.exports = swaggerConfig;
