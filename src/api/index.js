const AppServer = require('./app-server');
const serverConfig = require('./config/server-config');
const logger = require('winster').instance();

logger.trace('serverConfig', serverConfig);

(async () => {
  const server = new AppServer(serverConfig);
  await server.start();
})();
