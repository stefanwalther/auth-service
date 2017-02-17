const pkg = require('./../../../package.json');

class HealthCheckController {

  static get(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.send( {
      ts: new Date().toJSON(),
      name: pkg.name,
      repository: pkg.repository,
      version: pkg.version
    });
    next();
  }

}

module.exports = HealthCheckController;
