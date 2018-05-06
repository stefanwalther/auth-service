const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const UserModel = require('./../modules/user/user.model').Model;

const localStrategyOpts = {
  usernameField: 'username'
};

passport.use(new LocalStrategy(localStrategyOpts, function (username, password, done) {

  UserModel.findOne({
    'local.username': username,
    is_active: true,
    is_deleted: false
  }, (err, user) => {
    if (err) {
      return done(err);
    }
    // Return if user not found in database
    if (!user) {
      return done(null, false, {
        message: 'User not found'
      });
    }
    // Return if password is wrong
    if (!user.verifyLocalPassword(password)) {
      return done(null, false, {
        message: 'Password is wrong'
      });
    }
    // If credentials are correct, return the user object
    return done(null, user);
  });
}
));
