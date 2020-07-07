const HttpStatus = require('http-status-codes');
const ExpressResult = require('express-result');
const koaPassport = require('koa-passport');
const _ = require('lodash');
const utils = require('../../lib/utils');

const UserModel = require('./user.model').Model;
const logger = require('winster').instance();

const serverConfig = require('../../config/server-config');
const auditLogsConfig = require('../../config/audit-logs-config');

const auditLogService = require('sammler-io-audit-logs').instance(auditLogsConfig.connectionOpts);
const auditLogActions = require('../../config/audit-log-actions');

class UserController {

  static async get(ctx) {
    try {
      const result = await UserModel.find().lean();
      let resultCleaned = result.map(item => {
        return _.omit(item, ['local.salt', 'local.password', 'local.email_verification_code']);
      });
      ctx.status = HttpStatus.OK;
      ctx.body = resultCleaned;
    } catch (err) {
      ctx.status = HttpStatus.UNPROCESSABLE_ENTITY;
    }
  }

  static getById(ctx) {
    return UserModel
      .getById(ctx.params.id)
      .then(result => {
        ctx.status = HttpStatus.OK;
        ctx.body = result;
      })
      .catch(err => {
        ctx.status = HttpStatus.INTERNAL_SERVER_ERROR;
        ctx.body = err;
      });
  }

  // Todo: Validation could be generalized and probably broken out.
  // Todo: Validation needs unit testing
  // Todo: Validation should go to the mongoose model
  // Todo: Refactor, don't like how the returned object is created, that's too error-prone if new props are added.
  // Todo: Standardize results
  // Todo: Send event
  static registerLocal(ctx) {

    const validationErrors = new ExpressResult.ValidationErrors();
    if (!_.has(ctx.request.body, 'local.username')) {
      validationErrors.add('Property <local.username> missing.');
    }
    if (!_.has(ctx.request.body, 'local.password')) {
      validationErrors.add('Property <local.password> missing.');
    }
    // eslint-disable-next-line no-negated-condition
    if (!_.has(ctx.request.body, 'local.email')) {
      validationErrors.add('Property <local.email> missing.');
    } else {

      // eslint-disable-next-line no-lonely-if,no-negated-condition
      if (!utils.validateEmail(ctx.request.body.local.email)) {
        validationErrors.add('<local.email> is an invalid email-address.');
      } else {
        const domainFilter = ctx.config.REGISTRATION__DOMAIN_FILTER || '*';
        if (!utils.eMailInDomain(domainFilter, ctx.request.body.local.email)) {
          validationErrors.add('<local.email> is outside of one of the allowed domains (' + domainFilter + ').');
        }
      }
    }

    if (validationErrors.length > 0) {
      ctx.status = HttpStatus.UNPROCESSABLE_ENTITY;
      ctx.body = validationErrors;
      return;
    }

    let user;
    try {
      user = new UserModel(ctx.request.body);
    } catch (err) {
      ctx.status = HttpStatus.UNPROCESSABLE_ENTITY;
      ctx.body = err;
      return;
    }

    return user.save()
      .then(user => {
        const result = {
          _id: user._id,
          tenant_id: user.tenant_id,
          local: {
            username: user.local.username,
            email: user.local.email
          },
          is_active: user.is_active || false
        };
        if (serverConfig.ENABLE_AUDIT_LOG === true) {
          auditLogService.log(auditLogActions.SUBJECT_AUDIT_LOGS, auditLogActions.cloudEvents.getRegisterLocalEvent({user}));
        }
        ctx.status = HttpStatus.CREATED;
        ctx.body = result;
      })
      .catch(err => {
        logger.error('Err in registerLocal', err);

        ctx.status = HttpStatus.UNPROCESSABLE_ENTITY;
        ctx.body = err;
      });
  }

  // Todo: What should a failed login return, 400
  // Todo: Investigate how to properly use next() here
  // Todo: Standardize results
  // Todo: Break out validation
  static login(ctx, next) {

    const validationErrors = new ExpressResult.ValidationErrors();
    if (!ctx.request.body || !ctx.request.body.emailOrUsername) {
      validationErrors.add('Property <emailOrUsername> missing.');
    }

    if (!ctx.request.body || !ctx.request.body.password) {
      validationErrors.add('Property <password> missing.');
    }

    if (validationErrors.length > 0) {
      logger.verbose('ValidationErrors', validationErrors);
      ctx.status = HttpStatus.INTERNAL_SERVER_ERROR;
      ctx.body = validationErrors;
      return next();
    }

    return koaPassport.authenticate('local', function (err, user, info /* , status */) {

      // If Passport throws/catches an error
      if (err) {
        // Todo: Trigger audit-log
        logger.verbose('Passport threw an error', err);
        ctx.status = HttpStatus.INTERNAL_SERVER_ERROR;
        ctx.body = err;
        return next();
      }

      // If a user is found
      if (user) {
        const token = user.generateJwt();
        logger.verbose('OK, we have a token');

        // Todo: get the serverConfig from the koa-context
        if (serverConfig.ENABLE_AUDIT_LOG === true) {
          auditLogService.log(auditLogActions.SUBJECT_AUDIT_LOGS, auditLogActions.cloudEvents.getLoginEvent({user}));
        } else {
          logger.verbose(`We are not audit-logging here (${serverConfig.ENABLE_AUDIT_LOG}).`);
        }
        ctx.status = HttpStatus.OK;
        ctx.body = {token};
        return next();
      }

      // No user found
      logger.verbose('no user was found', info);
      ctx.status = HttpStatus.UNAUTHORIZED;
      ctx.body = info;
      return next();
    })(ctx, next);
  }

  /**
   * Removes the session token and redirects the user to /
   *
   * @Todo: Make configurable where to redirect to.
   * @Todo: Standardize results
   * @Todo: Send audit-log event
   */
  static async logout(/* ctx */) {
    // AuditLogService.log(auditLogActions.SUBJECT_AUDIT_LOGS, auditLogActions.cloudEvents.getLogoutEvent());

  }

  /**
   * Returns application/json with the user details for the cookie/token passed in the request.
   *
   */
  static async status(/* ctx, next */) {
  }

  // Todo: Standardize results
  // Todo: Send event
  static async delete(ctx) {

    try {
      let result = await UserModel.markAsDeleted(ctx.params.id);
      ctx.status = HttpStatus.OK;
      ctx.body = result;
    } catch (err) {
      ctx.status = HttpStatus.INTERNAL_SERVER_ERROR;
      ctx.body = err;
    }
  }

  // Todo: Standardize results
  // Todo: Send event
  static async unDelete(ctx) {

    try {
      let result = await UserModel.unMarkAsDeleted(ctx.params.id);
      ctx.response.status = HttpStatus.OK;
      ctx.body = result;
    } catch (err) {
      ctx.response.status = HttpStatus.INTERNAL_SERVER_ERROR;
      ctx.body = err;
    }

  }

  static async purge(ctx) {

    try {
      let result = await UserModel.remove({_id: ctx.params.id}).exec();
      ctx.status = HttpStatus.OK;
      ctx.body = result;
    } catch (err) {
      ctx.status = HttpStatus.INTERNAL_SERVER_ERROR;
      ctx.body = err;
    }

  }

  // Todo: Standardize results
  static async verifyToken(ctx) {

    const validationErrors = new ExpressResult.ValidationErrors();
    const token = (ctx.request.body && ctx.request.body.token) || ctx.request.headers['x-access-token'];
    if (!token) {
      validationErrors.add('Property <token> is missing. Put the <token> in either your body or use <x-access-token> in the Http-header.');
    }
    if (validationErrors.length > 0) {
      ctx.response.status = HttpStatus.INTERNAL_SERVER_ERROR;
      ctx.body = validationErrors;
      return;
    }

    try {
      const decoded = await UserModel.verifyToken(token);
      ctx.response.status = HttpStatus.OK;
      ctx.body = {message: 'Valid token.', details: decoded};
    } catch (err) {
      ctx.response.status = HttpStatus.INTERNAL_SERVER_ERROR;
      ctx.body = {message: 'Invalid token.'};
    }
  }

  // Todo: Nice idea, but figure out how this could be of help?
  // Reference: https://github.com/binocarlos/passport-service
  static me(ctx, next) {

    const token = (ctx.request.body && ctx.request.body.token) || ctx.headers['x-access-token'];
    try {
      const props = UserModel.verifyToken(token);
      let ret = _.pick(props, ['_id', 'username', 'email']);
      ctx.status = HttpStatus.OK;
      ctx.body = ret;
    } catch (err) {
      ctx.status = HttpStatus.UNAUTHORIZED;
      ctx.body = {message: `Invalid request: ${err.message}`};
    }
    next();
  }

  static patchUser(req, res, next) {

    // Const token = (req.body && req.body.token) || req.headers['x-access-token'];
    // const userId = req.params.id;
    try {
      // Let user = UserModel.findById(userId);
      res.status(HttpStatus.NO_CONTENT);

    } catch (err) {
      ExpressResult.unauthorized(res, {message: `Invalid request: ${err.message}`});
    }
    next();
  }

  static async verifyByUserId(ctx) {

    const {userId, code} = ctx.params;

    try {
      let user = await UserModel.verifyByUserId(userId, code);
      if (user && user.ok === 1) {
        ctx.status = HttpStatus.OK;
      } else {
        ctx.status = HttpStatus.UNAUTHORIZED;
      }
    } catch (err) {
      ctx.status = HttpStatus.INTERNAL_SERVER_ERROR;
      ctx.body = err;
    }

  }

  static async verifyByUserIdentifiers(ctx) {

    const code = ctx.params.code;
    const userIdentifier = ctx.params.IdOrEmail;

    try {
      let result = await UserModel.verifyByUserIdentifiers(userIdentifier, code);
      if (result && result.ok === 1) {
        ctx.status = HttpStatus.OK;
        return;
      }
      ctx.status = HttpStatus.NOT_FOUND;
    } catch (err) {
      ctx.status = HttpStatus.INTERNAL_SERVER_ERROR;
      ctx.body = err;
    }
  }

}

module.exports = UserController;
