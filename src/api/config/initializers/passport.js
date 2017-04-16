const passport = require('passport');

require('./../../middleware/passport-strategy.local');

module.exports = {
  after: 'body-parser',
  configure: app => {
    app.use(passport.initialize());
  }
};
