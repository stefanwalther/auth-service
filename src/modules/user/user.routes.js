const express = require('express');
const router = express.Router(); // eslint-disable-line new-cap
const UserController = require('./user.controller.js');

/**
 * @swagger
 * /user/register:
 *   post:
 *     description: Register a new user.
 *     produces:
 *       - application/json
 *     responses:
 *       201:
 *         description: Confirmation that the user has been created successfully.
 *
 */
router.post('/user/register', UserController.register);

/**
 * @swagger
 * /user/login:
 *   post:
 *     description: Login
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfully logged in.
 */
router.post('/user/login', UserController.login);

/**
 * @swagger
 * /user/logout:
 *   post:
 *     description: Logout
 *   produces:
 *     - application/json
 *   responses:
 *     200:
 *       description: Successfully logged out.
 */
router.post('/user/logout', UserController.logout); // Todo: Decide whether to use post or another verb (?!)

router.get('/user/status', UserController.status);

router.get('/user/password-reset-request', UserController.status);

module.exports = router;
