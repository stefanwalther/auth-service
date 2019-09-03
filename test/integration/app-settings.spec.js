const superTest = require('supertest');
const HttpStatus = require('http-status-codes');
const AppServer = require('./../../src/api/app-server');
const AppSettings = require('./../../src/api/config/app-settings');

const defaultConfig = require('./../test-lib/default-config');

describe('[integration] => app-settings', () => {

  let server;
  let appServer;

  beforeEach(async () => {
    appServer = new AppServer(defaultConfig);
    await appServer.start();
    server = superTest(appServer.server);
  });

  afterEach(async () => {
    await appServer.stop();
  });

  it('returns OK and a timestamp', () => {
    return server
      .get('/app-settings')
      .expect(HttpStatus.OK)
      .then(result => {
        console.log(result.body);
        expect(result).to.exist;
        expect(result).to.have.property('body');
        expect(result.body).to.have.property('app').to.deep.equal(AppSettings.app);
      });
  });
});
