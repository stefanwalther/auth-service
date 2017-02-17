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

  const router = express.Router();

  app.use('/', healthCheckRoutes);
  app.use('/', apiDocsRoutes);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(ApiDocsController.getDocs()));

  // user
  router.post('/v1/register', UserController.register);
  router.post('/v1/login', UserController.login);
  router.post('/v1/logout', UserController.logout); // Todo: Decide whether to use post or another verb (?!)
  router.get('/v1/status', UserController.status);
  router.post('/v1/verify-token', UserController.verifyToken); // Todo: Decide which verb to use (?!)

  // Todo: Nice idea, but figure out how this could be of help?
  // Reference: https://github.com/binocarlos/passport-service
  router.post('/v1/details', UserController.details);

  app.use(router);
}

module.exports = {
  init
};
