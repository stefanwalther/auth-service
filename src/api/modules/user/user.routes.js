const express = require('express');
const router = express.Router(); // eslint-disable-line new-cap
const UserController = require('./user.controller.js');

/**
 * @swagger
 * definitions:
 *   User:
 *     description: The user definition.
 *     required:
 *       - username
 *       - password
 *       - email
 *     properties:
 *       firstname:
 *         type: string
 *         example: "Max"
 *       lastname:
 *         type: string
 *         example: "Mustermann"
 *       local:
 *         $ref: "#/definitions/UserLocal"
 *
 *   UserLocal:
 *     description: Local authentication strategy
 *     properties:
 *       username:
 *         type: string
 *         example: "foo-user"
 *       email:
 *         type: string
 *         example: "foo@bar.com"
 *       password:
 *         type: string
 *         example: "passw0rd"
 *
 *
 *   # Todo: See registered claims: https://scotch.io/tutorials/the-anatomy-of-a-json-web-token
 *   UserStatus:
 *    description: Some details about the given user.
 *    properties:
 *      _id:
 *        type: ObjectId
 *        example: ""
 *      username:
 *        type: string
 *        example: "foo-user"
 *      email:
 *        type: string
 *        example: "foo@bar.com"
 *      token:
 *        type: string
 *        example: "foo-bar-token"
 *      status: # // Todo: implementation missing
 *        type: String
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
// Todo: Registration date should definitely be saved explicitly
/**
 * @swagger
 * /v1/user/register/local:
 *   post:
 *     description: Register a new user (using the local strategy).
 *     tags:
 *       - user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: User
 *         in: body
 *         description: The user to create.
 *         schema:
 *           $ref: "#/definitions/UserLocal"
 *     responses:
 *       201:
 *         description: Confirmation that the user has been created successfully.
 */
router.post('/v1/user/register/local', UserController.registerLocal);

// Todo: Login date (in case of successful login should be saved).
// Todo: Login attempt (in case of failed login should be saved).
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

router.get('/v1/user/:id', UserController.getById);

// Todo: Implement this
router.get('/v1/user/password-reset-request', UserController.status);

// Todo: Questionable whether the endpoint should include "user", could also just be "/v1/verify-token"
// Todo: Document 200 and 500 message in detail
/**
 * @swagger
 * /v1/user/verify-token:
 *   get:
 *     description: Verify a token. The token can be either passed within the body or the Http-header.
 *     tags:
 *       - user
 *   produces:
 *     - application/json
 *   parameters:
 *     - name: token
 *       in: body
 *       type: string
 *     - name: x-access-token
 *       in: header
 *       type: string
 *       description: Token passed in the Http-header.
 *   responses:
 *     200:
 *       description: Token verified.
 *       message: Valid token.
 *     500:
 *       description: Server error, token could not be verified.
 */
router.post('/v1/user/verify-token', UserController.verifyToken);

/**
 * @wagger
 * /v1/user/:id
 *   delete:
 *     description: Remove a user (which essentially just marks the user as `deleted`).
*      tags:
 *       - user
 *   produces:
 *     - application/json
 *   responses:
 *     200:
 *       description: User removed
 *     500:
 *       description: Server error
 */
router.delete('/v1/user/:id', UserController.delete);

// Todo: Test
// Todo: Document
router.patch('/v1/user/:id/delete', UserController.delete);

// Todo: Test
// Todo: Document
router.post('/v1/user/:id/undelete', UserController.unDelete);

module.exports = router;
