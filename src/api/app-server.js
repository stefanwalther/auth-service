const initializer = require('express-initializers');
const _ = require('lodash');
const express = require('express');
const logger = require('winster').instance();
const MongooseConnectionConfig = require('mongoose-connection-config');
const mongoose = require('mongoose');
const path = require('path');

const mongoUri = new MongooseConnectionConfig(require('./config/mongoose-config')).getMongoUri();

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

    // if (!this.config.PORT || !_.isNumber(this.config.PORT)) {
    //   throw new Error(`PORT is not a number: ${this.config.PORT}`);
    // }
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
      .then(mongoose.connect(mongoUri))
      .then(() => {
        this.server = this.app.listen(this._validateConfig.PORT, err => {
          if (err) {
            this.logger.error('Cannot start express server', err);
            throw err;
          }
          this.logger.info(`Express server listening on port ${this.config.PORT} in "${this.app.settings.env.NODE_ENV}" mode`);
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
      mongoose.connection.close()
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
