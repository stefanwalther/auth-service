const readPackageUpSync = require('read-pkg-up').readPackageUpSync;

const swaggerConfig = {
  swaggerDefinition: {
    info: {
      title: readPackageUpSync.packageJson.name,
      version: readPackageUpSync.packageJson.version,
      description: readPackageUpSync.packageJson.description
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
