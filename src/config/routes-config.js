const express = require('express');

const HealthCheckController = require('./../modules/health-check/healthcheck.controller');
const UserController = require('./../modules/user/user.controller');

/**
 * Initialize the routes.
 *
 * @param {Object} `app` - The express app.
 */
function init(app) {

  const router = express.Router();

  // health-check
  router.get('/health-check', HealthCheckController.get);

  // Todo: Decide whether to combine with health-check or not
  router.get('/version', HealthCheckController.version);

  // user
  router.post('/v1/register', UserController.register);
  router.post('/v1/login', UserController.login);
  router.post('/v1/logout', UserController.logout); // Todo: Decide whether to use post or another verb (?!)
  router.get('/v1/status', UserController.status);
  router.post('/v1/verify', UserController.verifyToken); // Todo: Decide which verb to use (?!)

  // Todo: Nice idea, but figure out how this could be of help?
  // Reference: https://github.com/binocarlos/passport-service
  router.post('/v1/details', UserController.details);




  app.use(router);
}

module.exports = {
  init
};
