const AppServer = require('./app-server');

const config = {
  PORT: 3001
};

const server = new AppServer(config);
server.start();
