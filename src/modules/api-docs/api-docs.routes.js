const express = require('express');
const router = express.Router();
const ApiDocsController = require('./api-docs.controller');

/**
 * @swagger
 * /api-docs:
 *   get:
 *     description: Return the formatted api-docs
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: username
 *         description: Username to use for login.
 *         in: formData
 *         required: true
 *         type: string
 *       - name: password
 *         description: User's password.
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: login
 */
router.get('/api-docs/raw', ApiDocsController.getRaw);

module.exports = router;
