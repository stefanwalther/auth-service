const HttpStatus = require('http-status-codes');
const ExpressResult = require('express-result');

const UserModel = require('./user.model').Model;

class UserController {

  /**
   *
   * @param req
   * @param res
   * @param next
   * @Todo: Validation could be generalized and probably broken out.
   */
  static register(req, res, next) {

    let validationErrors = new ExpressResult.ValidationErrors();
    if (!req.body.username) {
      validationErrors.add('Property <username> missing.');
    }
    if(!req.body.password) {
      validationErrors.add('Property <password> missing.');
    }
    if (!req.body.email) {
      validationErrors.add('Property <email> missing.');
    }

    if (validationErrors.length > 0 ){
      ExpressResult.error(res, validationErrors);
    }
    else {

      let user = new UserModel();
      user.username = req.body.username;
      user.email = req.body.email;
      user.setPassword(req.body.password);

      user.save(err => {

        // Todo: Text error handling
        if (err) {
          return next(err);
        }

        let token = user.generateJwt();
        res.status(HttpStatus.CREATED);
        res.json({
          token: token
        });
      });

      ExpressResult.json(res, {});
    }
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

  static login(req, res, next) {
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

  static verifyToken(req, res, next) {
    next();
  }

  static details(req, res, next) {
    next();
  }

}

module.exports = UserController;
