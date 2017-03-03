const express = require('express');
const router = express.Router(); // eslint-disable-line new-cap
const UserController = require('./user.controller.js');

/**
 * @swagger
 * definitions:
 *   User:
 *     required:
 *       - username
 *       - password
 *       - email
 *     properties:
 *       username:
 *         type: String
 *         example: "foo-user"
 *       email:
 *         type: String
 *         example: "foo@bar.com"
 *       password:
 *         type: String
 *         example: "passw0rd"
 *
 *   Login:
 *     required:
 *       - username
 *       - password
 *     properties:
 *       username:
 *         type: String
 *         example: "foo-user"
 *       password:
 *         type: String
 *         example: "passw0rd"
 *
 *   Token:
 *     required:
 *       - token
 *     properties:
 *       token:
 *         type: String
 *         example: "foo"
 *
 */

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
 *     tags:
 *       - user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Login
 *         in: body
 *         description: The login information.
 *         schema:
 *           $ref: "#/definitions/Login"
 *     responses:
 *       200:
 *         description: Successfully logged in.
 *       401:
 *         description: Unauthorized, wrong user/password combination.
 */
router.post('/v1/user/login', UserController.login);

/**
 * @swagger
 * /v1/user/logout:
 *   post:
 *     description: Logout
 *     tags:
 *       - user
 *   produces:
 *     - application/json
 *   responses:
 *     200:
 *       description: Successfully logged out.
 */
router.post('/v1/user/logout', UserController.logout); // Todo: Decide whether to use post or another verb (?!)

// Todo: Implement this
router.get('/v1/user/status', UserController.status);

// Todo: Implement this
router.get('/v1/user/password-reset-request', UserController.status);

// Todo: The approach of having a GET & POST does not seem to work for swagger; seems to be a bug.
// Todo: Document 200 and 500 message in detail
/**
 * @swagger
 * /v1/user/verify-token:
 *   post:
 *     description: Verify a token.
 *     tags:
 *       - user
 *   produces:
 *     - application/json
 *   parameters:
 *     - name: Token
 *       in: body
 *       schema:
 *         $ref: "#/definitions/Token"
 *   responses:
 *     200:
 *       description: Token verified.
 *       message: Valid token.
 *     500:
 *       description: Server error, token could not be verified.
 */
router.post('/v1/user/verify-token', UserController.verifyToken);

/**
 * @swagger
 * /v1/user/verify-token:
 *   get:
 *     description: Verify a token.
 *     tags:
 *       - user
 *   produces:
 *     - application/json
 *   parameters:
 *     - name: token
 *       in: query
 *       type: string
 *       example: foo
 *   responses:
 *     200:
 *       description: Token verified.
 *       message: Valid token.
 *     500:
 *       description: Server error, token could not be verified.
 */
router.get('/v1/user/verify-token', UserController.verifyToken);

module.exports = router;
