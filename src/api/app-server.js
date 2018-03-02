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
  async start() {

    await initializer(this.app, {directory: path.join(__dirname, 'config/initializers')});

    await mongoose.connect(mongoUri);

    try {
      this.server = await this.app.listen(this.config.PORT);
      this.logger.info(`Express server listening on port ${this.config.PORT} in ${this.app.settings.env.NODE_ENV} mode`);
    } catch (err) {
      this.logger.error('Cannot start express server', err);
    }
  }

  /**
   * Stop the auth-server.
   *
   * @returns {Promise}
   */
  async stop() {

    if (mongoose.connection) {
      try {
        await mongoose.connection.close();
        this.logger.trace('Closed mongoose connection');
      } catch (e) {
        this.logger.trace('Could not close mongoose connection', e);
      }
    }
    if (this.server) {
      try {
        await this.server.close();
        this.logger.trace('Server closed');
      } catch (e) {
        this.logger.trace('Could not close server', e);
      }
    }
  }
}

module.exports = AppServer;
