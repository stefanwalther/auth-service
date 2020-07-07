const helmet = require('koa-helmet');

module.exports = {
  priority: 2000,
  execute(app) {
    app.use(helmet());
  }
};
