const koaRouter = require('koa-router');
const ApiDocsController = require('./api-docs.controller');

const router = koaRouter();

/**
 * @swagger
 * /api-docs/raw:
 *   get:
 *     description: Return the formatted api-docs
 *     tags:
 *       - api-docs
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Json formatted api-docs.
 */
router.get('/api-docs/raw', ApiDocsController.getRaw);

module.exports = router;
