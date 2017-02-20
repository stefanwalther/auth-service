const express = require('express');
const router = express.Router(); // eslint-disable-line new-cap
const ApiDocsController = require('./api-docs.controller');

/**
 * @swagger
 * /api-docs:
 *   get:
 *     description: Return the formatted api-docs
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Json formatted api-docs.
 */
router.get('/api-docs/raw', ApiDocsController.getRaw);

module.exports = router;
