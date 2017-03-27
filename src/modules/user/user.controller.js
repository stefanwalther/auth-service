const ExpressResult = require('express-result');
const passport = require('passport');

const UserModel = require('./user.model').Model;
const UserBL = require('./user.bl');
// const UserModelAudit = require('./../user-audit/user-audit.model').Model;

class UserController {

  static getById(req, res) {
    return UserBL
      .getById(req.params.id)
      .then(result => {
        ExpressResult.ok(res, result);
      })
      .catch(err => ExpressResult.error(res, err));
  }

  // Todo: Validation could be generalized and probably broken out.
  // Todo: Refactor, don't like how the returned object is created, that's too error-prone if new props are added.
  static register(req, res) {

    const validationErrors = new ExpressResult.ValidationErrors();
    if (!req.body.username) {
      validationErrors.add('Property <username> missing.');
    }
    if (!req.body.password) {
      validationErrors.add('Property <password> missing.');
    }
    if (!req.body.local || !req.body.local.email) {
      validationErrors.add('Property <email> missing.');
    }

    if (validationErrors.length > 0) {
      return ExpressResult.error(res, validationErrors);
    }

    const user = new UserModel();
    user.local = {};
    user.username = req.body.username;
    user.is_deleted = req.body.is_deleted;
    user.local.email = req.body.local && req.body.local.email;
    user.setPassword(req.body.password);

    return user.save()
      .then(user => {
        const token = user.generateJwt();
        ExpressResult.created(res, {
          _id: user._id,
          username: user.username,
          is_deleted: user.is_deleted,
          is_active: user.is_active,
          is_verified: user.is_verified,
          email: user.local.email,
          token
        });
      })
      .catch(err => {
        ExpressResult.error(res, err);
      });
  }

  // Todo: What should a failed login return, 400
  // Todo: Investigate how to properly use next() here
  static login(req, res) {

    const validationErrors = new ExpressResult.ValidationErrors();
    if (!req.body.username) {
      validationErrors.add('Property <username> missing.');
    }

    if (!req.body.password) {
      validationErrors.add('Property <password> missing.');
    }

    if (validationErrors.length > 0) {
      return ExpressResult.error(res, validationErrors);
    }

    passport.authenticate('local', (err, user, info) => {

      // If Passport throws/catches an error
      if (err) {
        return ExpressResult.err(err);
      }

      // If a user is found
      if (user) {
        const token = user.generateJwt();
        return ExpressResult.ok(res, {token});
      }

      // No user found
      return ExpressResult.unauthorized(res, info);

    })(req, res);
  }

  /**
   * Removes the session token and redirects the user to /
   *
   * @Todo: Make configurable where to redirect to.
   *
   * @param req
   * @param res
   * @param next
   */
  static logout(req, res, next) {
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

  static delete(req, res) {

    return UserBL
      .markAsDeleted(req.params.id)
      .then(result => {
        return ExpressResult.ok(res, result);
      })
      .catch(err => {
        return ExpressResult.error(res, err);
      });
  }

  static unDelete(req, res) {

    return UserBL
      .unMarkAsDeleted(req.params.id)
      .then(result => {
        return ExpressResult.ok(res, result);
      })
      .catch(err => {
        return ExpressResult.error(res, err);
      });
  }

  static verifyToken(req, res, next) {

    const validationErrors = new ExpressResult.ValidationErrors();
    const token = (req.body && req.body.token) || (req.query && req.query.token) || req.headers['x-access-token']; // Todo: Verify x-access-token
    if (!token) {
      validationErrors.add('Property <token> is missing. Put the <token> in either your body, the query-string or the header.');
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
  static details(req, res, next) {

    next();
  }

}

module.exports = UserController;
