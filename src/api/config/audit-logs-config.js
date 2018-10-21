const config = require('./server-config');
module.exports = {
  connectionOpts: {
    clusterId: 'test-cluster',
    clientId: 'auth-service_' + process.pid,
    server: config.NATS_STREAMING_SERVER
  }
};
