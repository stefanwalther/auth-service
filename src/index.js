const AppServer = require('./app-server');
const serverConfig = require('./config/server-config');

const server = new AppServer(serverConfig);
server.start();
