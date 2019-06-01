const initializer = require('express-initializers');
const _ = require('lodash');
const express = require('express');
const logger = require('winster').instance();
const MongooseConnectionConfig = require('mongoose-connection-config');
const mongoose = require('mongoose');
const path = require('path');

const mongoUri = new MongooseConnectionConfig(require('./config/mongoose-config')).getMongoUri();
const defaultConfig = require('./config/server-config');

class AppServer {

  /**
   * @constructor
   * @param  {} config
   */
  constructor(config) {
    this.config = _.extend(_.clone(defaultConfig), config || {});
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
  }

  /**
   * Validate the configuration passed in and inherited from the default config.
   *
   * @private
   */
  _validateConfig() {

    if (!this.config.PORT) {
      throw new Error(`PORT is undefined: ${this.config.PORT}`);
    }

    let n = _.toNumber(this.config.PORT);
    if (!_.isNumber(n) || isNaN(n)) {
      throw new Error(`PORT is not a number: ${this.config.PORT}`);
    }
  }

  /**
   * Start the auth-server.
   * @async
   */
  async start() {

    await initializer(this.app, {directory: path.join(__dirname, 'config/initializers')});

    // Do not use `await`, otherwise buffering will not be used by mongoose.
    await mongoose.connect(mongoUri, {useNewUrlParser: true});

    try {
      this.server = await this.app.listen(this.config.PORT);
      this.logger.info(`Express server listening on port ${this.config.PORT} in "${this.config.NODE_ENV}" mode`);
    } catch (err) {
      this.logger.error('Cannot start express server', err);
    }
  }

  /**
   * Stop the auth-server.
   * @async
   */
  async stop() {

    if (mongoose.connection) {
      try {
        await mongoose.connection.close(); // Using Moongoose >5.0.4 connection.close is preferred over mongoose.disconnect();
        mongoose.models = {};
        mongoose.modelSchemas = {};
        this.logger.verbose('Closed mongoose connection');
      } catch (e) {
        this.logger.verbose('Could not close mongoose connection', e);
      }
    }

    if (this.server) {
      try {
        await this.server.close();
        this.logger.info('Server closed');
      } catch (e) {
        this.logger.verbose('Could not close server', e);
      }
    }
  }
}

module.exports = AppServer;
