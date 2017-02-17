class UserController {

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  static register(req, res, next) {
    next();
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
