const helmet = require('helmet');

module.exports = {
  configure: app => {
    app.use(helmet());
  }
};
