const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const mongoose = require('mongoose');
const timeStamps = require('mongoose-timestamp');

mongoose.Promise = global.Promise; // Todo: How to centralize this guy ...

const mongooseConfig = require('./../../config/mongoose-config');
const jwtConfig = require('./../../config/jwt-config');

const Schema = mongoose.Schema;

/* eslint-disable camelcase */
const schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: [6, 'Username too short, 6 characters required.']
  },
  is_active: {
    type: Boolean,
    default: false
  },
  is_verified: {
    type: Boolean,
    default: false
  },
  is_deleted: {
    type: Boolean,
    default: false
  },
  local: {
    email: {
      type: String,
      required: true,
      unique: true
    },
    hash: String,
    salt: String
  }
}, {
  collection: mongooseConfig.COLLECTION_PREFIX + '_user',
  strict: true
});
/* eslint-enable camelcase */

schema.index({username: 1, email: 1});
schema.plugin(timeStamps, {createdAt: 'created_at', updatedAt: 'updated_at'});

schema.methods.setPassword = password => {
  if (!this.local) {
    this.local = {};
  }
  this.local.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(
    password,
    this.local.salt,
    1000,
    64,
    'sha1').toString('hex');
};

schema.methods.validPassword = password => {
  const hash = crypto.pbkdf2Sync(
    password,
    this.local.salt,
    1000,
    64,
    'sha1').toString('hex');
  return this.hash === hash;
};

schema.methods.generateJwt = () => {

  return jwt.sign({
    _id: this._id,
    email: this.local.email,
    username: this.username,
    exp: moment().add(7, 'days').valueOf()
  }, jwtConfig.JWT_SECRET);
};

schema.statics.verifyToken = token => {
  return jwt.verify(token, jwtConfig.JWT_SECRET);
};

module.exports = {
  Schema: schema,
  Model: mongoose.model('user', schema)
};

