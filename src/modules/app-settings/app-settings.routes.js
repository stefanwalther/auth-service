const koaRouter = require('koa-router');
const AppSettingsController = require('./app-settings.controller');

let router = koaRouter();

router.get('/app-settings', AppSettingsController.get);

module.exports = router;

