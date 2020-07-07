const error = require('koa-json-error');
const _ = require('lodash');

module.exports = {
  priority: 9999,
  execute(app) {

    let options = {
      // Avoid showing the stacktrace in 'production' env
      postFormat: (e, obj) => process.env.NODE_ENV === 'production' ? _.omit(obj, 'stack') : obj
    };

    app.use(error(options));
  }
};
