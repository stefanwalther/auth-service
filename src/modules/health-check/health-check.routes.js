const express = require('express');
const router = express.Router(); // eslint-disable-line new-cap
const HealthCheckController = require('./health-check.controller.js');

/**
 * @swagger
 * /health-check:
 *   get:
 *     description: Get the service' status.
 *     produces:
 *       - application/json
 *     tags:
 *       - health-check
 *     responses:
 *       200:
 *         description: Returned health-check status.
 *         parameters:
 *           ts:
 *             type: Date
 *           name:
 *             type: String
 *           repository:
 *             type: String
 *           version:
 *             type: String
 *             description: "The name of the service: auth-service"
 */
router.get('/health-check', HealthCheckController.get);

module.exports = router;

