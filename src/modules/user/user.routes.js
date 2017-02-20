const express = require('express');
const router = express.Router(); // eslint-disable-line new-cap
const UserController = require('./user.controller.js');

// Todo: Document result
// Todo: Document possible Validation Errors
// Todo: Centralize tags (see https://apihandyman.io/writing-openapi-swagger-specification-tutorial-part-3-simplifying-specification-file/)
/**
 * @swagger
 * /v1/user/register:
 *   post:
 *     description: Register a new user.
 *     tags:
 *       - user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: User
 *         in: body
 *         description: The user to create.
 *         schema:
 *           $ref: "#/definitions/User"
 *     responses:
 *       201:
 *         description: Confirmation that the user has been created successfully.
 */
router.post('/v1/user/register', UserController.register);

/**
 * @swagger
 * /v1/user/login:
 *   post:
 *     description: Login
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successfully logged in.
 */
router.post('/v1/user/login', UserController.login);

/**
 * @swagger
 * /v1/user/logout:
 *   post:
 *     description: Logout
 *   produces:
 *     - application/json
 *   responses:
 *     200:
 *       description: Successfully logged out.
 */
router.post('/v1/user/logout', UserController.logout); // Todo: Decide whether to use post or another verb (?!)

router.get('/user/status', UserController.status);

router.get('/user/password-reset-request', UserController.status);

module.exports = router;
