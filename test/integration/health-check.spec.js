const superTest = require('supertest');
const HttpStatus = require('http-status-codes');
const AppServer = require('./../../src/api/app-server');

const defaultConfig = require('./../test-lib/default-config');
const pkg = require('read-pkg-up').sync().pkg;

describe('auth-service => health-check', () => {

  let server;
  let appServer;

  beforeEach(async () => {
    appServer = new AppServer(defaultConfig);
    await appServer.start();
    server = superTest(appServer.server);
  });

  afterEach(async () => {
    return await appServer.stop();
  });

  it('returns OK and a timestamp', () => {
    return server
      .get('/health-check')
      .expect(HttpStatus.OK)
      .then(result => {
        expect(result).to.exist;
        expect(result).to.have.property('body');
        expect(result.body).to.have.a.property('ts').to.exist;
        expect(result.body).to.have.a.property('version').to.be.equal(pkg.version);
      });
  });
});
