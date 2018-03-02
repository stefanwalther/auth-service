const AppServer = require('./app-server');
const serverConfig = require('./config/server-config');

console.log('serverConfig', serverConfig);

(async () => {
  const server = new AppServer(serverConfig);
  await server.start();
})();
