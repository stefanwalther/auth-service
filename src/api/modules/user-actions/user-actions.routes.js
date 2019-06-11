const express = require('express');
const router = express.Router(); // eslint-disable-line new-cap

const userActionsController = require('./user-actions.controller');

router.put('/v1/users/actions/send-verification-email', userActionsController.sendVerificationEmail);

module.exports = router;
