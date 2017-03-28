const express = require('express');
const router = express.Router(); // eslint-disable-line new-cap
const UserAuditController = require('./user-audit.controller.js');

/**
 * @swagger
 * definitions:
 *   UserAudit:
 *     properties:
 *       user_id:
 *         type: ObjectId
 *
 */

/**
 * @swagger
 * /v1/audit/
 *   get:
 *   description: Get all audits
 *   produces:
 *     - application/json
 *   responses:
 *     200:
 *       description: Returns all audits
 *     # Todo: Unauthorized
 */
// Todo: Authentication middleware, should definitely only be available to admins
// Todo: This means we have to define also groups ...
// Todo: Returns array of `UserAudit`
router.get('/v1/audit', UserAuditController.getAll);

module.exports = router;
