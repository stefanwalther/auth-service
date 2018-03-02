const morgan = require('morgan');
const morganLogger = morgan('dev', {silent: false});

module.exports = {
  configure: app => {
    morganLogger.silent = true;
    app.use(morganLogger);
  }
};

