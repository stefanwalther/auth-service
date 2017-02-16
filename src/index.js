const AppServer = require('./app-server');

const config = {
  PORT: 3001
};

let server = new AppServer(config);
server.start();
