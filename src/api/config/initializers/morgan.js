const expressLogger = require('morgan');

module.exports = {
  configure: app => {
    app.use(expressLogger('dev'));
  }
};

