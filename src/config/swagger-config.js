const pkg = require('./../../package.json');

const swaggerConfig =  {
  swaggerDefinition: {
    info: {
      title: 'auth-service',
      version: pkg.version
    },
  },
  apis: [
    './src/modules/api-docs/api-docs.routes.js'
  ]
};

module.exports = swaggerConfig;
