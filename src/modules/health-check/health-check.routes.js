const koaRouter = require('koa-router');
const HealthCheckController = require('./health-check.controller');

let router = koaRouter();

router.get('/health-check', HealthCheckController.get);

module.exports = router;
