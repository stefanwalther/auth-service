const compression = require('compression');

module.exports = {
  configure: app => {
    app.use(compression());
  }
};
