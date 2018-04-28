// Const passport = require('passport');
const passportJWT = require('passport-jwt');

// Const users = require('./../modules/user/user.model').Model;
const ExtractJwt = passportJWT.ExtractJwt;
// Const Strategy = passportJWT.Strategy;

const jwtConfig = require('./../config/jwt-config');

const params = {
  secretOrKey: jwtConfig.JWT_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeader()
};

module.exports = {
  params
};
