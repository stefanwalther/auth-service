const passport = require('koa-passport');

require('./../middleware/passport-strategy.local');

module.exports = {
  priority: 1001,
  execute(app) {
    app.use(
      passport.initialize()
    );
  }
};
