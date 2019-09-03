const express = require('express');
const swaggerUi = require('swagger-ui-express');

const ApiDocsController = require('./../modules/api-docs/api-docs.controller');
const apiDocsRoutes = require('./../modules/api-docs/api-docs.routes');
const healthCheckRoutes = require('./../modules/health-check/health-check.routes.js');
const userRoutes = require('./../modules/user/user.routes');
const userActionRoutes = require('./../modules/user-actions/user-actions.routes');
const appSettingsRoutes = require('./../modules/app-settings/app-settings.routes');

const router = express.Router(); // eslint-disable-line new-cap

// Todo: should be built dynamically
router.use('/', healthCheckRoutes);
router.use('/', apiDocsRoutes);
router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(ApiDocsController.getDocs()));
router.use('/', userRoutes);
router.use('/', userActionRoutes);
router.use('/', appSettingsRoutes);

module.exports = router;
