const express = require('express');
const swaggerUi = require('swagger-ui-express');

const UserController = require('./../modules/user/user.controller');

const ApiDocsController = require('./../modules/api-docs/api-docs.controller');
const apiDocsRoutes = require('./../modules/api-docs/api-docs.routes');
const healthCheckRoutes = require('./../modules/health-check/health-check.routes.js');
const userRoutes = require('./../modules/user/user.routes');

/**
 * Initialize the routes.
 *
 * @param {Object} `app` - The express app.
 */
function init(app) {

  const router = express.Router(); // eslint-disable-line new-cap

  app.use('/', healthCheckRoutes);
  app.use('/', apiDocsRoutes);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(ApiDocsController.getDocs()));

  // user
  app.use('/v1', userRoutes);
  router.post('/v1/verify-token', UserController.verifyToken); // Todo: Decide which verb to use (?!)

  // Todo: Nice idea, but figure out how this could be of help?
  // Reference: https://github.com/binocarlos/passport-service
  router.post('/v1/details', UserController.details);

  app.use(router);
}

module.exports = {
  init
};
