const routesConfig = require('./../routes-config');

module.exports = {
  after: 'passport',
  configure: app => {
    // Todo: refactor
    app.use(routesConfig);
  }
};
