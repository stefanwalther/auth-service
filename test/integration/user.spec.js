const superTest = require('supertest');
const HttpStatus = require('http-status-codes');
const AppServer = require('./../../src/api/app-server');

const UserModel = require('./../../src/api/modules/user/user.model').Model;
const defaultConfig = require('./../test-lib/default-config');
const userAssertions = require('./../test-lib/user-assertions');

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
      .expect(HttpStatus.CREATED)
      .expect(userAssertions.hasToken);
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
      is_active: true,
      local: {
        email: 'foo@bar.com'
      }
    };

    return server
      .post('/v1/user/register')
      .send(user)
      .expect(HttpStatus.CREATED)
      .expect(userAssertions.hasToken)
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
      .expect(userAssertions.hasToken)
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

  /* eslint-disable max-nested-callbacks */
  it('DELETE /v1/user:id => marks a user as deleted', () => {
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
      .expect(userAssertions.hasToken)
      .then(result => {
        expect(result.body).to.have.a.property('_id').to.not.be.empty;
        expect(result.body).to.have.a.property('is_deleted').to.be.false;
        return server
          .delete(`/v1/user/${result.body._id}`)
          .expect(HttpStatus.OK)
          .then(updateResult => {
            expect(updateResult.body).to.have.property('n').to.be.equal(1);
            expect(updateResult.body).to.have.property('nModified').to.be.equal(1);
            expect(updateResult.body).to.have.property('ok').to.be.equal(1);

            return server
              .get(`/v1/user/${result.body._id}`)
              .then(updatedUser => {
                expect(updatedUser).to.exist;
                expect(updatedUser.body).to.exist;
                expect(updatedUser.body).to.have.property('is_deleted').to.be.true;
              });

          });
      });
  });
  // eslint-enable max-nested-callbacks

  it('GET /v1/user/login => will not allow deactivated users to login', () => {
    const user = {
      username: 'foo-user',
      password: 'passw0rd',
      is_deleted: false,
      is_active: false,
      local: {
        email: 'foo@bar.com'
      }
    };

    return server
      .post('/v1/user/register')
      .send(user)
      .expect(HttpStatus.CREATED)
      .expect(userAssertions.hasToken)
      .then(() => {
        return server
          .post('/v1/user/login')
          .send(user)
          .expect(HttpStatus.UNAUTHORIZED)
          .then(result => {
            expect(result.body).to.contain.a.property('message', 'User not found');
          });
      });

  });

  it('GET /v1/user/login => will not allow deleted users to login', () => {
    const user = {
      username: 'foo-user',
      password: 'passw0rd',
      is_deleted: true,
      local: {
        email: 'foo@bar.com'
      }
    };

    return server
      .post('/v1/user/register')
      .send(user)
      .expect(HttpStatus.CREATED)
      .expect(userAssertions.hasToken)
      .then(() => {
        return server
          .post('/v1/user/login')
          .send(user)
          .expect(HttpStatus.UNAUTHORIZED)
          .then(result => {
            expect(result.body).to.contain.a.property('message', 'User not found');
          });
      });
  });

  xit('GET /v1/user/verify-token => will not verify if a user is deleted', () => {

  });

  xit('GET /v1/users => should only be allowed to be executed by admins', () => {

  });
});
