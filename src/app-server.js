const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const compression = require('compression');
const helmet = require('helmet');
const logger = require('winster').instance();
const expressLogger = require('morgan');

class AppServer {
  constructor(config) {
    this.config = config || {};

    this.server = null;
    this.logger = logger;

    this._initApp();
  }

  _initApp() {
    this.app = express();
    this.app.use(expressLogger('dev'));
    this.app.use(compression());
    this.app.use(helmet());
    this.app.use(bodyParser.urlencoded({extended: true}));
    this.app.use(bodyParser.json());
    this.app.use(cors());
  }

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

  stop() {
    return new Promise(resolve => {
      this.server.close(() => {
        this.logger.info('Server stopped');
        resolve();
      });
    });
  }

}

module.exports = AppServer;
