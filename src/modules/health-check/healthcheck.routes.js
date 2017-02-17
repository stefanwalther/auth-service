const express = require('express');
const router = express.Router();
const HealthCheckController = require('./healthcheck.controller');

router.get('/health-check', HealthCheckController.get);

module.exports = router;

