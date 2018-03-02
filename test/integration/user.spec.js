const superTest = require('supertest');
const HttpStatus = require('http-status-codes');
const mongoose = require('mongoose');

const AppServer = require('./../../src/api/app-server');
const UserModel = mongoose.models.User || require('./../../src/api/modules/user/user.model').Model;
const defaultConfig = require('./../test-lib/default-config');
const userAssertions = require('./../test-lib/user-assertions');

describe('auth-service => user', () => {

  let server;
  let appServer;

  beforeEach(async () => {
    appServer =  new AppServer(defaultConfig);
    await appServer.start();
    server = superTest(appServer.server);
    await UserModel.remove();
  });

  afterEach(async () => {
    return await appServer.stop();
  });

  describe('UserModel', () => {
    it('registering a new user throws an error if user already exists', async () => {

      let user1 = new UserModel({
        username: 'test',
        password: 'test',
        local: {
          email: 'test@bar.com'
        }
      });
      await user1.save();

      let user2 = new UserModel({
        username: 'test',
        password: 'test',
        local: {
          email: 'test@foobar.com'
        }
      });

      try {
        await user2.save();
      } catch (e) {
        expect(e).to.exist;
        expect(e.name).to.be.equal('BulkWriteError');
      }
    });

    it('is fine registering multiple users (with different usernames)', async() => {
      let user1 = new UserModel({
        username: 'test',
        password: 'test',
        local: {
          email: 'test@bar.com'
        }
      });
      await user1.save();

      let user2 = new UserModel({
        username: 'test2',
        password: 'test',
        local: {
          email: 'test@foobar.com'
        }
      });

      try {
        await user2.save();
      } catch (e) {
        expect(e).to.not.exist;
      }
    })
  });

  describe('POST /user/register', () => {

    it('throws validation errors for required fields', async () => {

      const doc = {};

      await server
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

    it('creates a new user', () => {
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

  });

  describe('POST /user/login', () => {

    it('throws validation errors for required fields', () => {

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

    it('returns 401/Unauthorized if login fails (no user found)', () => {
      const doc = {
        username: 'foo-user',
        password: 'passw0rd'
      };
      return server
        .post('/v1/user/login')
        .send(doc)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('returns 401/Unauthorized if login fails (user found, password does not match)', () => {

      const user = {
        username: 'foo-user',
        password: 'passw0rd',
        local: {
          email: 'foo@bar.com'
        }
      };

      const login = {
        username: 'foo-user',
        password: 'other-password'
      };

      const newUser = new UserModel(user);
      newUser.setPassword(user.password);

      return newUser.save()
        .then(() => {
          return server
            .post('/v1/user/login')
            .send(login)
            .expect(HttpStatus.UNAUTHORIZED);
        });

    });

    it('returns a token if successfully logged in', () => {

      const user = {
        username: 'foo-user',
        password: 'passw0rd',
        is_active: true,
        local: {
          email: 'foo@bar.com'
        }
      };

      const newUser = new UserModel(user);
      newUser.setPassword(user.password);

      return newUser.save()
        .then(() => {
          return server
            .post('/v1/user/login')
            .send(user)
            .expect(HttpStatus.OK)
            .expect(userAssertions.hasToken);
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
      .expect(userAssertions.invalidToken);
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
        return server
          .post(`/v1/user/verify-token?token=${result.body.token}`)
          .expect(HttpStatus.OK)
          .expect(userAssertions.validToken);
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
      .then(() => {
        return server
          .post('/v1/user/login')
          .send(user)
          .expect(HttpStatus.UNAUTHORIZED)
          .expect(userAssertions.userNotFound);
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
      .then(() => {
        return server
          .post('/v1/user/login')
          .send(user)
          .expect(HttpStatus.UNAUTHORIZED)
          .expect(userAssertions.userNotFound);
      });
  });

  xit('GET /v1/user/verify-token => will not verify if a user is marked as deleted', () => {

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
      .then(result => {
        return server
          .post(`/v1/user/verify-token?token=${result.body.token}`)
          .expect(HttpStatus.OK)
          .expect(userAssertions.validToken);
      });

  });

  // Todo: We don't have the concept at all right now ..
  xit('GET /v1/users => should only be allowed to be executed by admins', () => {

  });
});
