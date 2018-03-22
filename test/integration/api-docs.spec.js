const superTest = require('supertest');
const HttpStatus = require('http-status-codes');
const AppServer = require('./../../src/api/app-server');

const defaultConfig = require('./../test-lib/default-config');
const pkg = require('read-pkg-up').sync().pkg;

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
        console.log(result.body);
        expect(result).to.exist;
        expect(result).to.have.a.property('body').to.exist;
        expect(result.body).to.deep.include({swagger: '2.0'});
        expect(result.body).to.have.a.property('info');
        expect(result.body.info).to.include({title: pkg.name});
        expect(result.body.info).to.include({version: pkg.version});
      });
  });

  it('GET /api-docs/raw => contains the definitions', () => {
    return server
      .get('/api-docs/raw')
      .expect(HttpStatus.OK)
      .then(result => {
        console.log(result.body);
        expect(result).to.exist;
        expect(result).to.have.a.property('body').to.exist;
        expect(result.body).to.have.a.property('definitions');
      });

  });

  it('GET /api-docs/raw => contains all routes as defined', () => {
    return server
      .get('/api-docs/raw')
      .expect(HttpStatus.OK)
      .then(result => {
        expect(result.body.paths).to.have.property('/api-docs/raw');
        expect(result.body.paths).to.have.property('/health-check');
        expect(result.body.paths).to.have.property('/v1/user/login');
        expect(result.body.paths).to.have.property('/v1/user/logout');
        expect(result.body.paths).to.have.property('/v1/user/register/local');
        expect(result.body.paths).to.have.property('/v1/user/verify-token');
      });
  });

  it('GET /api-docs => returns the swagger docs', () => {
    return server
      .get('/api-docs')
      .expect(HttpStatus.MOVED_PERMANENTLY);
  });
});
