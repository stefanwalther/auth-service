const _ = require('lodash');
const bluebird = require('bluebird');
const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');
const express = require('express');
const expressLogger = require('morgan');
const favicon = require('serve-favicon');
const helmet = require('helmet');
const logger = require('winster').instance();
const MongooseConnection = require('mongoose-connection-promise');
const passport = require('passport');
const path = require('path');

const mongooseConfig = require('./config/mongoose-config');
const routesConfig = require('./config/routes-config');

const mongooseConnection = new MongooseConnection(mongooseConfig);

global.Promise = bluebird;

class AppServer {
  constructor(config) {
    this.config = config || {}; // Todo: add more tests, we need a better pattern; something is not stable here.
    this._validateConfig();

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
    this.app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

    this.app.settings.env = process.env; // Todo: something is wrong here.

    // Todo: refactor
    require('./middleware/passport-strategy.local');

    this.app.use(passport.initialize());
    this.app.use(routesConfig);
  }

  _validateConfig() {

    if (!this.config.PORT || !_.isNumber(this.config.PORT)) {
      throw new Error('PORT is not a number.');
    }

  }

  /**
   * Start the auth-server.
   *
   * @returns {Promise}
   */
  start() {

    return new Promise((resolve, reject) => {
      mongooseConnection.connect()
        .then(connection => {
          this.app.db = connection;
          this.server = this.app.listen(this._validateConfig.PORT, err => {
            if (err) {
              this.logger.error('Cannot start express server', err);
              return reject(err);
            }
            this.logger.info(`Express server listening on port ${this._validateConfig.PORT} in "${this.app.settings.env.NODE_ENV}" mode`);
            return resolve();
          });
        })
        .catch(err => {
          this.logger.fatal('Error creating a mongoose connection', err);
          throw err;
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
      mongooseConnection.disconnect()
        .then(() => {

          if (this.server) {
            this.server.close(() => {
              this.logger.info('Server stopped');
              return resolve();
            });
          }
          return resolve();

        })
        .catch(err => {
          this.logger.error('Could not disconnect from MongoDB', err);
          throw err;
        });
    });
  }
}

module.exports = AppServer;
