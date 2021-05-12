const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const mongoose = require('mongoose');
const _ = require('lodash');
const logger = require('winster').instance();
const beautifyUnique = require('mongoose-beautiful-unique-validation');

// Libs
const utils = require('../../lib/utils');

// Configs
const MongooseConfig = require('../../config/mongoose-config');
const jwtConfig = require('../../config/jwt-config');
const appSettings = require('../../config/app-settings');

const Schema = mongoose.Schema;

const localStrategySchema = new Schema({
  username: {
    type: String,
    required: false,
    unique: 'The field <username> is already used ({VALUE}).',
    minlength: [3, 'Username too short, 3 characters required.']
  },
  email: {
    type: String,
    required: false,
    unique: 'The field <email> is already used ({VALUE}).'
  },
  password: String,
  salt: String,
  email_verification_code: {
    type: String,
    required: true,
    default: utils.randomString(8, '#A')
  },
  email_verified: {
    type: Boolean,
    default: appSettings.registration.local.isEmailVerifiedDefault
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
  roles: [String],
  lastname: {
    type: String,
    required: false
  },
  is_active: {
    type: Boolean,
    default: appSettings.registration.isActiveDefault
  },
  is_deleted: {
    type: Boolean,
    default: appSettings.registration.isDeletedDefault
  },
  is_blocked: {
    type: Boolean,
    default: appSettings.registration.isBlockedDefault
  },
  local: localStrategySchema
}, {
  collection: MongooseConfig.COLLECTION_PREFIX + MongooseConfig.COLLECTION_USER,
  strict: true,
  timestamps: {createdAt: MongooseConfig.FIELD_CREATED_AT, updatedAt: MongooseConfig.FIELD_UPDATED_AT}
});
/* eslint-enable camelcase */

schema.plugin(beautifyUnique);

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
    roles: this.roles,
    // Todo: expiration needs to be configurable
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

schema.statics.verifyByUserId = (userId, emailVerificationCode) => {

  return mongoose.model(MongooseConfig.COLLECTION_USER, schema)
    .updateOne(
      {
        _id: userId,
        'local.email_verification_code': emailVerificationCode
      },
      {
        $set:
          {
            'local.email_verified': true
          }
      }
    )
    .exec();
};

/**
 * Verify the user
 *
 * @param userIdentifiers {string} - Either the user's email or the user's id.
 * @param emailVerificationCode {string} - The verification code.
 * @returns {Promise<any>}
 */
schema.statics.verifyByUserIdentifiers = (userIdentifiers, emailVerificationCode) => {

  return mongoose.model(MongooseConfig.COLLECTION_USER, schema)
    .updateOne(
      {
        $or: [
          {
            'local.email': userIdentifiers,
            'local.email_verification_code': emailVerificationCode
          },
          {
            'local.username': userIdentifiers,
            'local.email_verification_code': emailVerificationCode
          }
        ]
      },
      {
        $set:
          {
            'local.email_verified': true
          }
      }
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
    logger.verbose('[user:pre:save] do nothing, not modified');
    return next();
  }

  if (user.local && user.local.password) {
    user.setLocalPassword(user.local.password);
  } else {
    logger.verbose('[user:pre:save]] => do nothing');
  }
  return next();
});

// Ensure virtual fields are serialised.
schema.set('toJSON', {
  virtuals: true
});

module.exports = {
  Schema: schema,
  Model: mongoose.model(MongooseConfig.COLLECTION_USER, schema)
};

