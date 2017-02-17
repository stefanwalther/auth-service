const AppServer = require('./app-server');

const config = {
  PORT: 3010
};

const server = new AppServer(config);
server.start();
