const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const compression = require('compression');
const helmet = require('helmet');
const logger = require('winster').instance();
const expressLogger = require('morgan');
const bluebird = require('bluebird');

const routesConfig = require('./config/routes-config');

global.Promise = bluebird;

class AppServer {
  constructor(config) {
    this.config = config || {};

    this.server = null;
    this.logger = logger;

    this._initApp();
  }

  /**
   * Initialize the express app.
   *
   * @private
   */
  _initApp() {
    this.app = express();
    this.app.use(expressLogger('dev'));
    this.app.use(compression());
    this.app.use(helmet());
    this.app.use(bodyParser.urlencoded({extended: true}));
    this.app.use(bodyParser.json());
    this.app.use(cors());

    this.app.settings.env = process.env;

    routesConfig.init(this.app);
  }

  /**
   * Start the auth-server.
   *
   * @returns {Promise}
   */
  start() {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.config.PORT, err => {
        if (err) {
          this.logger.error('Cannot start express server', err);
          return reject(err);
        }
        this.logger.info('Express server listening on port %d in "%s" mode', this.config.PORT, this.app.settings.env);
        return resolve();
      });
    });
  }

  /**
   * Stop the auth-server.
   *
   * @returns {Promise}
   */
  stop() {
    return new Promise(resolve => {
      if (this.server) {
        this.server.close(() => {
          this.logger.info('Server stopped');
          return resolve();
        });
      }
      return resolve();
    });
  }
}

module.exports = AppServer;
