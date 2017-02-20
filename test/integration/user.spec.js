const superTest = require('supertest-as-promised');
const HttpStatus = require('http-status-codes');
const AppServer = require('./../../src/app-server');

const UserModel = require('./../../src/modules/user/user.model').Model;
const defaultConfig = require('./../test-lib/default-config');

describe('auth-service => user', () => {

  let server;
  const appServer = new AppServer(defaultConfig);
  beforeEach(() => {
    return appServer.start()
      .then(() => {
        server = superTest(appServer.server);
        return UserModel.remove({}).exec();
      });
  });

  afterEach(() => {
    return appServer.stop();
  });

  it('POST /register => throws validation errors for required fields', () => {

    const doc = {};

    return server
      .post('/v1/user/register')
      .send(doc)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .then(result => {
        expect(result).to.exist;
        expect(result.body).to.exist;
        expect(result.body).to.have.a.property('ValidationErrors');
        expect(result.body.ValidationErrors).to.contain('Property <username> missing.');
        expect(result.body.ValidationErrors).to.contain('Property <password> missing.');
        expect(result.body.ValidationErrors).to.contain('Property <email> missing.');
      });
  });

  it('POST /register => created a new user', () => {
    const doc = {
      username: 'foofoo',
      email: 'foo@bar.com',
      password: 'bar'
    };

    return server
      .post('/v1/user/register')
      .send(doc)
      .expect(HttpStatus.CREATED)
      .then(result => {
        expect(result).to.exist;
        expect(result).to.have.a.property('body').to.exist;
        expect(result.body).to.have.a.property('token');
      });
  });

});
