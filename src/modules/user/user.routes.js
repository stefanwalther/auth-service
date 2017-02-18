const express = require('express');
const router = express.Router();
const UserController = require('./user.controller.js');

router.post('/register', UserController.register);

module.exports = router;
