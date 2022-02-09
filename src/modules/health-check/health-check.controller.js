import { readPackageUpSync } from 'read-pkg-up';


class HealthCheckController {

  static get(ctx) {
    ctx.status = 200;
    ctx.body = {
      ts: new Date().toJSON(),
      name: readPackageUpSync.packageJson.name,
      repository: readPackageUpSync.packageJson.repository,
      version: readPackageUpSync.packageJson.version
    };
  }
}

module.exports = HealthCheckController;
