const passport = require('koa-passport');
const LocalStrategy = require('passport-local').Strategy;
const UserModel = require('../modules/user/user.model').Model;
const logger = require('winster').instance();

const localStrategyOpts = {
  usernameField: 'emailOrUsername',
  passwordField: 'password'
};

passport.use(new LocalStrategy(localStrategyOpts, function (emailOrUsername, password, done) {

  UserModel.findOne(
    {
      $or: [
        {
          'local.username': emailOrUsername,
          is_active: true,
          is_deleted: false
        },
        {
          'local.email': emailOrUsername,
          is_active: true,
          is_deleted: false
        }
      ]
    }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        // Return if user not found in database
        return done(null, false, {
          message: 'User not found.'
        });
      }
      if (user && user.local.email_verified === false) {
        return done(null, false, {
          message: 'Email not verified.'
        });
      }

      // Return if password is wrong
      if (!user.verifyLocalPassword(password)) {
        return done(null, false, {
          message: 'Password is wrong.'
        });
      }

      // If credentials are correct, return the user object
      logger.verbose('passport.local: we have a user');
      return done(null, user);
    });
}
));
