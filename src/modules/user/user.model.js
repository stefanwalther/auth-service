const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const mongooseConfig = require('./../../config/mongoose-config');
const jwtConfig = require('./../../config/jwt-config');

const Schema = mongoose.Schema;

/* eslint-disable camelcase */
const schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    require: true,
    unique: true
  },
  hash: String,
  salt: string

}, {
  collection: mongooseConfig.COLLECTION_PREFIX + mongooseConfig.COLLECTION_AUTH,
  strict: true
});
/* eslint-enable camelcase */

schema.methods.validPassword = function(password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
  return this.hash === hash;
};

schema.methods.generateJwt = function() {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);

  return jwt.sign({
    _id: this._id,
    email: this.email,
    username: this.username,
    exp: parseInt(expiry.getTime() / 1000),
  }, jwtConfig.JWT_SECRET);
};

module.exports = {
  Schema: schema,
  Model: mongoose.model(mongooseConfig.COLLECTION_AUTH, schema)
};

