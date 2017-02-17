class HealthCheckController {

  static get(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.send({ts: new Date().toJSON()});
    next();
  }

  static version(req, res, next) {
    next();
  }

}

module.exports = HealthCheckController;
