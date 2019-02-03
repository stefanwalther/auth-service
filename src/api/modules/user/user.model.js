const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const mongoose = require('mongoose');
const _ = require('lodash');

const MongooseConfig = require('./../../config/mongoose-config');
const jwtConfig = require('./../../config/jwt-config');
const logger = require('winster').instance();

const Schema = mongoose.Schema;

const localStrategySchema = new Schema({
  username: {
    type: String,
    required: false,
    unique: true,
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
  tenant_id: {
    type: Schema.Types.ObjectId,
    required: true,
    auto: true
  },
  firstname: {
    type: String,
    required: false
  },
  lastname: {
    type: String,
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
  collection: MongooseConfig.COLLECTION_PREFIX + MongooseConfig.COLLECTION_USER,
  strict: true,
  timestamps: {createdAt: MongooseConfig.FIELD_CREATED_AT, updatedAt: MongooseConfig.FIELD_UPDATED_AT}
});
/* eslint-enable camelcase */

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
    tenant_id: this.tenant_id,
    user_id: this._id,
    email: this.local.email,
    username: this.local.username,
    firstname: this.firstname,
    lastname: this.lastname,
    groups: [
      'user'
    ],
    exp: moment().add(7, 'days').valueOf()
  }, jwtConfig.JWT_SECRET);
};

schema.statics.verifyToken = token => {
  return jwt.verify(token, jwtConfig.JWT_SECRET);
};

schema.statics.markAsDeleted = id => {

  return mongoose.model(MongooseConfig.COLLECTION_USER, schema)
    .update(
      {_id: id},
      {$set: {is_deleted: true}}
    )
    .exec();
};

schema.statics.unMarkAsDeleted = id => {
  return mongoose.model(MongooseConfig.COLLECTION_USER, schema)
    .update(
      {_id: id},
      {$set: {is_deleted: false}}
    )
    .exec();
};

schema.statics.getById = id => {
  return mongoose.model(MongooseConfig.COLLECTION_USER, schema)
    .findById(id)
    .exec();
};

// Todo: needs testing
schema.statics.getDeleted = () => {

  return mongoose.model(MongooseConfig.COLLECTION_USER, schema)
    .find({is_deleted: true})
    .exec();
};

// Todo: needs testing
schema.statics.purge = () => {
  return mongoose.model(MongooseConfig.COLLECTION_USER, schema)
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
  Model: mongoose.model(MongooseConfig.COLLECTION_USER, schema)
};

