const AppServer = require('./app-server');
const serverConfig = require('./config/server-config');

(async () => {
  const server = new AppServer(serverConfig);
  await server.start();
})();
