const favicon = require('koa-favicon');
const path = require('path');

module.exports = {
  priority: 100,
  execute(app) {
    app.use(favicon(path.join(__dirname, './../public', 'favicon.ico')));
  }
};
