const koaRouter = require('koa-router');
const UserController = require('./user.controller.js');
const passport = require('passport');
const authRequired = require('./../../middleware/auth-required');

let router = koaRouter();

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
 *         $ref: "#/definitions/LocalStrategy"
 *
 *   UserLocal:
 *     description: A user (using the local strategy).
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
 *         $ref: "#/definitions/LocalStrategy"
 *
 *   LocalStrategy:
 *     description: Local authentication strategy
 *     required:
 *       - username
 *       - password
 *       - email
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
 *       - emailOrUsername
 *       - password
 *     properties:
 *       emailOrUsername:
 *         type: string
 *         example: foo@bar.com
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

const API_VERSION = 'v1';

router.get(`/${API_VERSION}/users`, authRequired, UserController.get);

router.patch(`/${API_VERSION}/user/:id`, UserController.patchUser);

// Todo: Document result
// Todo: Document possible Validation Errors
// Todo: Centralize tags (see https://apihandyman.io/writing-openapi-swagger-specification-tutorial-part-3-simplifying-specification-file/)
// Todo: Registration date should definitely be saved explicitly
// Todo: Reference to a global definition of the validation error
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
 *       - name: UserLocal
 *         in: body
 *         description: The user to create (using the local strategy).
 *         schema:
 *           $ref: "#/definitions/UserLocal"
 *     responses:
 *       201:
 *         description: Confirmation that the user has been created successfully.
 *       500:
 *         description: Validation Error.
 */
router.post(`/${API_VERSION}/user/register/local`, UserController.registerLocal);

// Todo: Login date (in case of successful login should be saved) => goes to audit + one function is needed to get the last login date.
// Todo: Login attempt (in case of failed login should be saved) => goes to audit + one function is needed to get the last login attempt.
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
router.post(`/${API_VERSION}/user/login`, UserController.login);

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
router.post(`/${API_VERSION}/user/logout`, UserController.logout); // Todo: Decide whether to use post or another verb (?!)

// Todo: Implement this
router.get(`/${API_VERSION}/user/status`, UserController.status);

// Todo: Only possible to be fetched by the user himself or by the admin
router.get(`/${API_VERSION}/users/:id`, UserController.getById);

// Todo: Implement this
router.get(`/${API_VERSION}/user/password-reset-request`, UserController.status);

// Todo: Questionable whether the endpoint should include "user", could also just be "/v1/verify-token"
// Todo: Document 200 and 500 message in detail
// Todo: Change to `GET`
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
router.post(`/${API_VERSION}/user/verify-token`, UserController.verifyToken);

/**
 * @swagger
 * /v1/me:
 *   get:
 *     description: Get information about the current (authenticated user).
 *     tags:
 *       - user
 *   produces:
 *     - application/json
 *   parameters:
 *     - name: _id
 *       type: string
 *       description: The user id.
 *       example: 5aee4655ddb60e7e2de107ba
 *     - name: email
 *       type: string
 *       description: The user's email address.
 *       example: foo@bar.com
 *     - name: username
 *       type: string
 *       description: The user's username.
 *       example: foo
 *   responses:
 *     200:
 *       description: Information about the current authenticated user.
 *     401:
 *       description: Unauthorized
 */
router.get(`/${API_VERSION}/me`, UserController.me);

// Todo: Test
// Todo: Document
/**
 * @swagger
 * /v1/user/:id:
 *   delete:
 *     description: Remove a user (which essentially just marks the user as `deleted`). This can only be executed by the user himself or by an admin.
 *     tags:
 *       - user
 *   produces:
 *     - application/json
 *   responses:
 *     200:
 *       description: User removed
 *     403:
 *       description: Permission denied
 *     500:
 *       description: Server error
 */
router.delete(`/${API_VERSION}/user/:id`, UserController.delete);

// Todo: Test
// Todo: Document
// Todo: Should be a `PUT` as this needs to be idempotent
router.post(`/${API_VERSION}/user/:id/undelete`, UserController.unDelete);

router.put(`/${API_VERSION}/user/:userId/actions/verify-with-id/:code`, UserController.verifyByUserId);

router.put(`/${API_VERSION}/user/:IdOrEmail/actions/verify/:code`, UserController.verifyByUserIdentifiers);

/**
 * @swagger
 * /v1/user/:id/purge:
 *   delete:
 *     description: Purge a user entirely. (Can only be executed by an admin).
 *     tags:
 *       - user
 *   security:
 *     - JWT: [admin]
 *   produces:
 *     - application/json
 *   responses:
 *     200:
 *       description: User has been purged.
 *     403:
 *       description: Permission denied.
 *     500:
 *       description: Unhandled server error.
 */
router.delete(`/${API_VERSION}/user/:id/purge`, passport.authenticate('jwt', {session: false}), UserController.purge);

router.post(`/${API_VERSION}/user/:id/activation`, authRequired, UserController.activate);
router.delete(`/${API_VERSION}/user/:id/activation`, authRequired, UserController.deactivate);

router.post(`/${API_VERSION}/user/:id/block`, authRequired, UserController.block);

router.delete(`/${API_VERSION}/user/:id/block`, authRequired, UserController.unblock);

module.exports = router;
