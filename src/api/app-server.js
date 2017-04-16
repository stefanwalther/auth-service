const initializer = require('express-initializers');
const _ = require('lodash');
const bluebird = require('bluebird');
const express = require('express');
const logger = require('winster').instance();
const MongooseConnection = require('mongoose-connection-promise');
const path = require('path');

const mongooseConfig = require('./config/mongoose-config');

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

    this.app.settings.env = process.env; // Todo: something is wrong here.

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

    return initializer(this.app,
      {
        directory: path.join(__dirname, 'config/initializers')
      })
      .then(mongooseConnection.connect())
      .then(connection => {
        this.app.db = connection;
        return connection;
      })
      .then(() => {
        this.server = this.app.listen(this._validateConfig.PORT, err => {
          if (err) {
            this.logger.error('Cannot start express server', err);
            throw err;
          }
          this.logger.info(`Express server listening on port ${this._validateConfig.PORT} in "${this.app.settings.env.NODE_ENV}" mode`);
        });
      })
      .catch(err => {
        this.logger.fatal(err);
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
