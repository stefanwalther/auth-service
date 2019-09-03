const appSettings = require('./../../config/app-settings');

class AppSettingsController {

  static get(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.send(appSettings);
    next();
  }
}

module.exports = AppSettingsController;
