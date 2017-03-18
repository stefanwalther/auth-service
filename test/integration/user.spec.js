const superTest = require('supertest');
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
        expect(result.body).to.have.a.property('ValidationErrors');
        expect(result.body.ValidationErrors).to.contain('Property <username> missing.');
        expect(result.body.ValidationErrors).to.contain('Property <password> missing.');
        expect(result.body.ValidationErrors).to.contain('Property <email> missing.');
      });
  });

  it('POST /register => created a new user', () => {
    const doc = {
      username: 'foofoo',
      password: 'bar',
      local: {
        email: 'foo@bar.com'
      }
    };

    return server
      .post('/v1/user/register')
      .send(doc)
      // .expect(HttpStatus.CREATED)
      .then(result => {
        expect(result.body).to.have.a.property('token');
        expect(result.body.token).to.exist;
      })
      .catch(err => {
        expect(err).to.not.exist;
      });
  });

  it('POST /login => throws validation errors for required fields', () => {

    const doc = {};
    return server
      .post('/v1/user/login')
      .send(doc)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .then(result => {
        expect(result.body).to.have.a.property('ValidationErrors');
        expect(result.body.ValidationErrors).to.contain('Property <username> missing.');
        expect(result.body.ValidationErrors).to.contain('Property <password> missing.');
      });
  });

  it('POST /login => return 401/Unauthorized if login fails (no user found)', () => {
    const doc = {
      username: 'foo-user',
      password: 'passw0rd'
    };
    return server
      .post('/v1/user/login')
      .send(doc)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('POST /login => return 401/Unauthorized if login fails (user found, password does not match)', () => {

    const user = {
      username: 'foo-user',
      password: 'passw0rd',
      email: 'foo@bar.com'
    };

    const login = {
      username: 'foo-user',
      password: 'other-password'
    };

    return server
      .post('/v1/user/register')
      .send(user)
      // .expect(HttpStatus.CREATED)
      .then(() => {
        return server
          .post('/v1/user/login')
          .send(login)
          .expect(HttpStatus.UNAUTHORIZED);
      })
      .catch(err => {
        expect(err).to.exist;
      });
  });

  it('POST /login => returns a token if successfully logged in', () => {

    const user = {
      username: 'foo-user',
      password: 'passw0rd',
      local: {
        email: 'foo@bar.com'
      }
    };

    return server
      .post('/v1/user/register')
      .send(user)
      .expect(HttpStatus.CREATED)
      .then(() => {
        delete user.email;
        return server
          .post('/v1/user/login')
          .send(user)
          .expect(HttpStatus.OK)
          .then(result => {
            expect(result.body).to.have.a.property('token');
          });
      });
  });

  it('POST /verify-token => returns an error if not token is passed', () => {
    return server
      .post('/v1/user/verify-token')
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .then(result => {
        expect(result.body).to.have.a.property('ValidationErrors');
        expect(result.body.ValidationErrors).to.contain('Property <token> is missing. Put the <token> in either your body, the query-string or the header.');
      });
  });

  it('POST /verify-token => does not throw a validation error if token is passed in body', () => {
    const doc = {
      token: 'foo'
    };
    return server
      .post('/v1/user/verify-token')
      .send(doc)
      .then(result => {
        expect(result.body).to.not.have.a.property('ValidationErrors');
      });
  });

  it('POST /verify-token => does not throw a validation error if token is passed in querystring', () => {
    return server
      .post('/v1/user/verify-token?token=foo')
      .then(result => {
        expect(result.body).to.not.have.a.property('ValidationErrors');
      });
  });

  it('POST /v1/user/verify-token => returns an error if the token is invalid', () => {

    const doc = {
      token: 'foo'
    };

    return server
      .post('/v1/user/verify-token')
      .send(doc)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .then(result => {
        expect(result.body).to.exist;
        expect(result.body).to.have.a.property('message').to.be.equal('Invalid token.');
      });
  });

  it('POST /v1/user/verify-token => returns OK if the token is valid', () => {

    const user = {
      username: 'foo-user',
      password: 'passw0rd',
      local: {
        email: 'foo@bar.com'
      }
    };

    return server
      .post('/v1/user/register')
      .send(user)
      .expect(HttpStatus.CREATED)
      .then(result => {
        expect(result.body).to.have.a.property('token').to.exist;
        return server
          .post(`/v1/user/verify-token?token=${result.body.token}`)
          .expect(HttpStatus.OK)
          .then(result => {
            expect(result.body).to.exist;
            expect(result.body).to.have.a.property('message').to.be.equal('Valid token.');
          });
      });
  });

  // Todo: Not implemented
  xit('DELETE /v1/user:id => marks a user as deleted', () => {
    const user = {
      username: 'foo-user',
      password: 'passw0rd',
      email: 'foo@bar.com'
    };

    return server
      .post('/v1/user/register')
      .send(user)
      .expect(HttpStatus.CREATED)
      .then(result => {
        expect(result.body).to.have.a.property('_id').to.not.be.empty;
        expect(result.body).to.have.a.property('username').to.be.equal(user.username);
        // expect(result.body).to.have.a.property('local.email').to.be.equal(user.email);
        expect(result.body).to.have.a.property('token').to.exist;
        // return server
        //   .delete('/')
      });
  });

  it('GET /v1/user/login => will not allow deactivated users to login', () => {

  });

  it('GET /v1/user/verify-token => will not verify if a user is deleted', () => {

  });

  xit('POST /logout => should logout an existing user', () => {
    expect(true).to.be.false;
  });
});
