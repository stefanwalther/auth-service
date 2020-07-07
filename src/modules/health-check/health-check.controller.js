const pkg = require('read-pkg-up').sync().packageJson;

class HealthCheckController {

  static get(ctx) {
    ctx.status = 200;
    ctx.body = {
      ts: new Date().toJSON(),
      name: pkg.name,
      repository: pkg.repository,
      version: pkg.version
    };
  }
}

module.exports = HealthCheckController;
