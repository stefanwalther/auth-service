// const passport = require('passport');
const passportJWT = require('passport-jwt');

// const users = require('./../modules/user/user.model').Model;
const ExtractJwt = passportJWT.ExtractJwt;
// const Strategy = passportJWT.Strategy;

const jwtConfig = require('./../config/jwt-config');

const params = {
  secretOrKey: jwtConfig.JWT_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeader()
};

module.exports = {
  params
};
