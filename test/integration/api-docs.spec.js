const superTest = require('supertest-as-promised');
const HttpStatus = require('http-status-codes');
const AppServer = require('./../../src/app-server');

const defaultConfig = require('./../test-lib/default-config');
const pkg = require('./../../package.json');

describe('auth-service => api-docs', () => {

  let server;
  const appServer = new AppServer(defaultConfig);
  before(() => {
    return appServer.start()
      .then(() => {
        server = superTest(appServer.server);
      });
  });

  after(() => {
    return appServer.stop();
  });

  it('GET /api-docs/raw => returns the raw api-docs', () => {
    return server
      .get('/api-docs/raw')
      .expect(HttpStatus.OK)
      .then(result => {
        expect(result).to.exist;
        expect(result).to.have.a.property('body').to.exist;
        expect(result.body).to.deep.include({swagger: '2.0'});
        expect(result.body).to.deep.include({info: {title: 'auth-service', version: '0.1.0'}});
      });
  });

  it('GET /api-docs => returns the swagger docs', () => {
    return server
      .get('/api-docs')
      .expect(HttpStatus.MOVED_PERMANENTLY)
  })
});
