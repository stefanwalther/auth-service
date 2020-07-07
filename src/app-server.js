const _ = require('lodash');
const Koa = require('koa');
const logger = require('winster').instance();
const MongooseConnectionConfig = require('mongoose-connection-config');
const mongoose = require('mongoose');
const path = require('path');
const mongooseConfig = require('./config/mongoose-config');

const initializer = require('koa-initializer');
const routes = require('./routes');

const mongoUri = new MongooseConnectionConfig(mongooseConfig).getMongoUri();
const defaultConfig = require('./config/server-config');
const defaultAppSettings = require('./config/app-settings');

class AppServer {

  /**
   * @constructor
   * @param  {} config
   */
  constructor(config, appSettings) {
    this.config = _.extend(_.clone(defaultConfig), config || {});
    this.appSettings = _.extend(_.clone(defaultAppSettings), appSettings || {});

    if (['dev', 'development'].indexOf(this.config.NODE_ENV) > -1 && this.config.DEBUG_CONFIG === 'true') {
      console.log(this.config);
      console.log(mongooseConfig);
    }

    // Todo(AAA): re-enable this
    // this._validateConfig();

    this.app = null;
    this.server = null;
    this.logger = logger;

    this.app = new Koa();
    this.app.context.config = this.config;
    this.app.context.appSettings = this.appSettings;
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

    await initializer(this.app, path.join(__dirname, './initializers'));

    this.app.use(routes());

    // Start mongoose
    try {
      // Don't use `await`, otherwise buffering in mongoose does not work.
      if (this.config.NODE_ENV === 'development') {
        this.logger.verbose('connection string (development env): ', mongooseConfig.connection_string);
      }
      mongoose.connect(mongoUri, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true});

    } catch (err) {
      logger.fatal(`[app-server] Cannot connect to mongodb`, err);
    }

    // Start the AppServer
    try {
      this.server = await this.app.listen(this.config.PORT);

      process.on('SIGTERM', function () {
        this.server.close(function () {
          process.exit(0);
        });
      });

      this.logger.info(
        `[app-server] Koa server listening on port ${this.config.PORT} in "${
          this.config.NODE_ENV
        }" mode`
      );
    } catch (err) {
      this.logger.fatal('[app-server] Cannot start koa server', err);
      throw err;
    }
  }

  /**
   * Stop the auth-server.
   * @async
   */
  async stop() {

    await this._stopMongoose();
    await this._stopServer();
  }

  async _stopMongoose() {
    if (mongoose.connection) {
      try {
        // Mongoose.models = {};
        // mongoose.modelSchemas = {};
        await mongoose.connection.close(); // Using Moongoose >5.0.4 connection.close is preferred over mongoose.disconnect();
        this.logger.verbose('[app-server] Closed mongoose connection');
      } catch (e) {
        this.logger.verbose('[app-server] Could not close mongoose connection', e);
        throw e;
      }
    }
  }

  async _stopServer() {
    if (this.server) {
      try {
        await this.server.close();
        this.logger.info('[app-server] Server closed');
      } catch (err) {
        this.logger.error('[app-server] Could not close server', err);
        throw err;
      }
    } else {
      this.logger.trace('[app-server]  No server to close');
    }
  }

}

module.exports = AppServer;
