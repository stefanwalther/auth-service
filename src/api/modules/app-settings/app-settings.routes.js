const express = require('express');
const router = express.Router(); // eslint-disable-line new-cap
const AppSettingsController = require('./app-settings.controller');

router.get('/app-settings', AppSettingsController.get);

module.exports = router;

