const bodyWrap = require('./../middleware/koa-body-wrap');

module.exports = {
  priority: 1500,
  execute(app) {
    app.use(bodyWrap());
  }
};
