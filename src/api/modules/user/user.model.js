const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const mongoose = require('mongoose');
const timeStamps = require('mongoose-timestamp');
const _ = require('lodash');

const mongooseConfig = require('./../../config/mongoose-config');
const jwtConfig = require('./../../config/jwt-config');
const logger = require('winster').instance();

const Schema = mongoose.Schema;

const localStrategySchema = new Schema({
  username: {
    type: String,
    required: false,
    unique: false,
    minlength: [3, 'Username too short, 3 characters required.']
  },
  email: {
    type: String,
    required: false,
    unique: false
  },
  password: String,
  salt: String,
  is_verified: {
    type: Boolean,
    default: false
  }
});

/* eslint-disable camelcase */
const schema = new Schema({
  firstname: {
    type: String,
    required: false
  },
  lastname: {
    type: String,
    required: false
  },
  scope: {
    type: Array,
    required: false
  },
  is_active: {
    type: Boolean,
    default: true
  },
  is_verified: {
    type: Boolean,
    default: false
  },
  is_deleted: {
    type: Boolean,
    default: false
  },
  local: localStrategySchema
}, {
  collection: mongooseConfig.COLLECTION_PREFIX + mongooseConfig.COLLECTION_USER,
  strict: true
});
/* eslint-enable camelcase */

// schema.index({"local.username": 1});
schema.plugin(timeStamps, {createdAt: mongooseConfig.FIELD_CREATED_AT, updatedAt: mongooseConfig.FIELD_UPDATED_AT});

schema.methods.setLocalPassword = function (password) {
  if (!this.local) {
    this.local = {};
  }
  if (_.isEmpty(password)) {
    throw new Error('Password must be set');
  }
  this.local.salt = crypto.randomBytes(16).toString('hex');
  let pwd = crypto.pbkdf2Sync( // eslint-disable-line no-multi-assign
    password,
    this.local.salt,
    1000,
    64,
    'sha1').toString('hex');

  this.local.password = pwd;
};

schema.methods.verifyLocalPassword = function (password) {
  const hash = crypto.pbkdf2Sync(
    password,
    this.local.salt,
    1000,
    64,
    'sha1').toString('hex');
  return this.local.password === hash;
};

schema.methods.generateJwt = function () {

  return jwt.sign({
    _id: this._id,
    email: this.local.email,
    username: this.local.username,
    firstname: this.firstname,
    lastname: this.lastname,
    exp: moment().add(7, 'days').valueOf()
  }, jwtConfig.JWT_SECRET);
};

schema.statics.verifyToken = token => {
  return jwt.verify(token, jwtConfig.JWT_SECRET);
};

schema.statics.markAsDeleted = id => {

  return mongoose.model(mongooseConfig.COLLECTION_USER, schema)
    .update(
      {_id: id},
      {$set: {is_deleted: true}}
    )
    .exec();
};

schema.statics.unMarkAsDeleted = id => {
  return mongoose.model(mongooseConfig.COLLECTION_USER, schema)
    .update(
      {_id: id},
      {$set: {is_deleted: false}}
    )
    .exec();
};

schema.statics.getById = id => {
  return mongoose.model(mongooseConfig.COLLECTION_USER, schema)
    .findById(id)
    .exec();
};

// Todo: needs testing
schema.statics.getDeleted = () => {

  return mongoose.model(mongooseConfig.COLLECTION_USER, schema)
    .find({is_deleted: true})
    .exec();
};

// Todo: needs testing
schema.statics.purge = () => {
  return mongoose.model(mongooseConfig.COLLECTION_USER, schema)
    .remove({is_deleted: true})
    .exec();
};

// http://devsmash.com/blog/password-authentication-with-mongoose-and-bcrypt
schema.pre('save', function (next) {
  let user = this;

  // Only hash the password if it has been modified (or is new)
  if (!user.isModified('local.password')) {
    logger.verbose('do nothing, not modified');
    return next;
  }
  logger.verbose('change password');
  logger.verbose('user', user);

  if (user.local && user.local.password) {
    logger.verbose('OK; set a password', user.local);
    user.setLocalPassword(user.local.password);
  } else {
    logger.verbose('no', user);
    logger.verbose('---');
  }
  next();
});

module.exports = {
  Schema: schema,
  Model: mongoose.model(mongooseConfig.COLLECTION_USER, schema)
};

