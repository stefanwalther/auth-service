const ExpressResult = require('express-result');
const passport = require('passport');
const _ = require('lodash');

const UserModel = require('./user.model').Model;
const logger = require('winster').instance();
// Todo: Remove eslint disabler
const guard = require('express-jwt-permissions'); // eslint-disable-line no-unused-vars

const auditLogsConfig = require('./../../config/audit-logs-config');

const auditLogService = require('sammler-io-audit-logs').instance(auditLogsConfig.connectionOpts);
const auditLogActions = require('../../config/audit-log-actions');

class UserController {

  // Todo: Standardize results
  static getById(req, res) {
    return UserModel
      .getById(req.params.id)
      .then(result => {
        ExpressResult.ok(res, result);
      })
      .catch(err => ExpressResult.error(res, err));
  }

  // Todo: Validation could be generalized and probably broken out.
  // Todo: Validation needs unit testing
  // Todo: Validation should go to the mongoose model
  // Todo: Refactor, don't like how the returned object is created, that's too error-prone if new props are added.
  // Todo: Standardize results
  // Todo: Send event
  static registerLocal(req, res) {

    logger.info('Registering using local strategy', req.body);

    const validationErrors = new ExpressResult.ValidationErrors();
    if (!_.has(req.body, 'local.username')) {
      validationErrors.add('Property <local.username> missing.');
    }
    if (!_.has(req.body, 'local.password')) {
      validationErrors.add('Property <local.password> missing.');
    }
    if (!_.has(req.body, 'local.email')) {
      validationErrors.add('Property <local.email> missing.');
    }

    if (validationErrors.length > 0) {
      return ExpressResult.error(res, validationErrors);
    }

    const user = new UserModel(req.body);

    logger.verbose('save user', user);

    return user.save()
      .then(user => {
        const result = {
          _id: user._id,
          username: user.username,
          is_active: user.is_active || false,
          is_verified: user.is_verified || false,
          email: user.email
        };
        auditLogService.log(auditLogActions.SUBJECT_AUDIT_LOGS, auditLogActions.cloudEvents.getRegisterEvent(user._id));
        ExpressResult.created(res, result);
      })
      .catch(err => {
        logger.error('Err in registerLocal', err);
        ExpressResult.error(res, err);
      });
  }

  // Todo: What should a failed login return, 400
  // Todo: Investigate how to properly use next() here
  // Todo: Standardize results
  static login(req, res) {

    logger.verbose('Login with ', req.body.username, req.body.password);

    const validationErrors = new ExpressResult.ValidationErrors();
    if (!req.body.username) {
      validationErrors.add('Property <username> missing.');
    }

    if (!req.body.password) {
      validationErrors.add('Property <password> missing.');
    }

    if (validationErrors.length > 0) {
      logger.verbose('ValidationErrors', validationErrors);
      return ExpressResult.error(res, validationErrors);
    }

    passport.authenticate('local', function (err, user, info) {

      // If Passport throws/catches an error
      if (err) {
        // Todo: Trigger audit-log
        logger.verbose('Passport threw an error', err);
        return ExpressResult.error(err);
      }

      // If a user is found
      if (user) {
        const token = user.generateJwt();
        logger.verbose('OK, we have a result', token);
        auditLogService.log(auditLogActions.SUBJECT_AUDIT_LOGS, auditLogActions.cloudEvents.getLoginEvent(user._id));
        return ExpressResult.ok(res, {token});
      }

      // No user found
      logger.verbose('no user was found', info);
      return ExpressResult.unauthorized(res, info);

    })(req, res);
  }

  /**
   * Removes the session token and redirects the user to /
   *
   * @Todo: Make configurable where to redirect to.
   * @Todo: Standardize results
   *
   * @param req
   * @param res
   * @param next
   */
  static logout(req, res, next) {
    auditLogService.log(auditLogActions.SUBJECT_AUDIT_LOGS, auditLogActions.cloudEvents.getLogoutEvent());
    next();
  }

  /**
   * Returns application/json with the user details for the cookie/token passed in the request.
   *
   * @param req
   * @param res
   * @param next
   */
  static status(req, res, next) {
    next();
  }

  // Todo: Standardize results
  // Todo: Send event
  static delete(req, res) {

    return UserModel
      .markAsDeleted(req.params.id)
      .then(result => {
        return ExpressResult.ok(res, result);
      })
      .catch(err => {
        return ExpressResult.error(res, err);
      });
  }

  // Todo: Standardize results
  // Todo: Send event
  static unDelete(req, res) {

    return UserModel
      .unMarkAsDeleted(req.params.id)
      .then(result => {
        return ExpressResult.ok(res, result);
      })
      .catch(err => {
        return ExpressResult.error(res, err);
      });
  }

  static purge(req, res) {

    return UserModel
      .remove({_id: req.params.id})
      .exec()
      .then(result => {
        return ExpressResult.ok(res, result);
      })
      .catch(err => {
        return ExpressResult.error(res, err);
      });
  }

  // Todo: Standardize results
  static verifyToken(req, res, next) {

    const validationErrors = new ExpressResult.ValidationErrors();
    const token = (req.body && req.body.token) || req.headers['x-access-token'];
    if (!token) {
      validationErrors.add('Property <token> is missing. Put the <token> in either your body or use <x-access-token> in the Http-header.');
    }
    if (validationErrors.length > 0) {
      return ExpressResult.error(res, validationErrors);
    }

    try {
      const decoded = UserModel.verifyToken(token);
      ExpressResult.ok(res, {message: 'Valid token.', details: decoded});
    } catch (err) {
      ExpressResult.error(res, {message: 'Invalid token.'});
    }
    next();
  }

  // Todo: Nice idea, but figure out how this could be of help?
  // Reference: https://github.com/binocarlos/passport-service
  static me(req, res, next) {

    const token = (req.body && req.body.token) || req.headers['x-access-token'];
    try {
      const props = UserModel.verifyToken(token);
      let ret = _.pick(props, ['_id', 'username', 'email']);
      ExpressResult.ok(res, ret);
    } catch (err) {
      ExpressResult.unauthorized(res, {message: `Invalid request: ${err.message}`});
    }
    next();
  }

}

module.exports = UserController;
