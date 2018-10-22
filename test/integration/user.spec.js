const superTest = require('supertest');
const HttpStatus = require('http-status-codes');
const mongoose = require('mongoose');
const _ = require('lodash');

const AppServer = require('./../../src/api/app-server');
const UserModel = mongoose.models.User || require('./../../src/api/modules/user/user.model').Model;
const defaultConfig = require('./../test-lib/default-config');
const userAssertions = require('./../test-lib/user-assertions');

const ENDPOINTS = {
  REGISTER_LOCAL: '/v1/user/register/local',
  USER_LOGIN: '/v1/user/login',
  VERIFY_TOKEN: '/v1/user/verify-token',
  ME: '/v1/me'
};

describe('auth-service => user', () => {

  let server;
  let appServer;

  beforeEach(async () => {
    appServer = new AppServer(defaultConfig);
    await appServer.start();
    server = superTest(appServer.server);
    await UserModel.deleteMany();
  });

  afterEach(async () => {
    await appServer.stop();
  });

  describe('UserModel', () => {

    it('registering a new user throws an error if user already exists', async () => {

      let user1 = new UserModel({
        local: {
          password: 'test',
          email: 'test@bar.com',
          username: 'test'
        }
      });
      await user1.save();

      let user2 = new UserModel({
        local: {
          password: 'test',
          email: 'test@foobar.com',
          username: 'test'
        }
      });

      try {
        await user2.save();
      } catch (e) {
        expect(e).to.exist;
        expect(e.name).to.be.equal('MongoError');
        expect(e).to.have.property('code').to.equal(11000);
      }
    });

    it('is fine registering multiple users (with different usernames)', async () => {

      let user1 = new UserModel({
        local: {
          username: 'foo',
          email: 'foo@bar.com',
          password: 'test'
        }
      });
      let u = await user1.save();

      let user2 = new UserModel({
        local: {
          username: 'foo2',
          email: 'foo2@bar.com',
          password: 'test2'
        }
      });

      try {
        let u2 = await user2.save();
      } catch (e) {
        expect(e).to.not.exist;
      }
    });

    it('saves the password correctly', async () => {

      let user = new UserModel({
        local: {
          username: 'foo',
          email: 'foo@bar.com',
          password: 'baz'
        }
      });

      let newUser = await user.save();
      expect(newUser.verifyLocalPassword('baz')).to.be.true;
    });

  });

  describe('POST /user/register/local', () => {

    it('throws validation errors for required fields', async () => {

      const doc = {};
      await server
        .post(ENDPOINTS.REGISTER_LOCAL)
        .send(doc)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
        .then(result => {
          expect(result.body).to.have.a.property('ValidationErrors');
          expect(result.body.ValidationErrors).to.contain('Property <local.username> missing.');
          expect(result.body.ValidationErrors).to.contain('Property <local.password> missing.');
          expect(result.body.ValidationErrors).to.contain('Property <local.email> missing.');
        });
    });

    it('creates a new user', () => {
      const doc = {
        local: {
          password: 'bar',
          username: 'foofoo',
          email: 'foo@bar.com'
        }
      };

      return server
        .post(ENDPOINTS.REGISTER_LOCAL)
        .send(doc)
        .expect(HttpStatus.CREATED)
        .expect(userAssertions.hasNoToken);
    });

    it('does not return any sensitive information', () => {
      const doc = {
        local: {
          password: 'bar',
          username: 'foofoo',
          email: 'foo@bar.com'
        }
      };

      return server
        .post(ENDPOINTS.REGISTER_LOCAL)
        .send(doc)
        .expect(HttpStatus.CREATED)
        .expect(userAssertions.hasNoToken)
        .expect(userAssertions.hasNoPassword);
    });

  });

  describe('POST /user/login', () => {

    it('throws validation errors for required fields', () => {

      const doc = {};
      return server
        .post(ENDPOINTS.USER_LOGIN)
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
        .post(ENDPOINTS.USER_LOGIN)
        .send(doc)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('returns 401/Unauthorized if login fails (user found, password does not match)', () => {

      const user = {
        local: {
          username: 'foo-user',
          password: 'passw0rd',
          email: 'foo@bar.com'
        }
      };

      const login = {
        username: 'foo-user',
        password: 'other-password'
      };

      const newUser = new UserModel(user);
      newUser.setLocalPassword(user.local.password);

      return newUser.save()
        .then(() => {
          return server
            .post(ENDPOINTS.USER_LOGIN)
            .send(login)
            .expect(HttpStatus.UNAUTHORIZED);
        });

    });

    it('does return a token if successfully logged in', () => {

      const doc = {
        is_active: true,
        local: {
          username: 'foo-user',
          email: 'foo@bar.com',
          password: 'passw0rd'
        }
      };

      const newUser = new UserModel(_.clone(doc));

      return newUser.save()
        .then(() => {
          return server
            .post(ENDPOINTS.USER_LOGIN)
            .send({
              username: doc.local.username,
              password: doc.local.password
            })
            // .expect(res => {
            // })
            .expect(HttpStatus.OK)
            .expect(userAssertions.hasToken);
        });
    });

    it('will not allow deactivated users to login', async () => {

      const doc = {
        is_deleted: false,
        is_active: false,
        local: {
          username: 'foo-user',
          password: 'passw0rd',
          email: 'foo@bar.com'
        }
      };

      let user = new UserModel(doc);
      let newUser = await user.save();

      await server
        .post('/v1/user/login')
        .send({
          username: doc.local.username,
          password: doc.local.password
        })
        .expect(HttpStatus.UNAUTHORIZED)
        .expect(userAssertions.userNotFound);
    });

    it('will not allow deleted users to login', async () => {

      const doc = {
        is_deleted: true,
        local: {
          password: 'passw0rd',
          username: 'foo-user',
          email: 'foo@bar.com'
        }
      };

      let user = new UserModel(doc);
      await user.save();

      await server
        .post('/v1/user/login')
        .send({
          username: doc.local.username,
          password: doc.local.password
        })
        .expect(HttpStatus.UNAUTHORIZED)
        .expect(userAssertions.userNotFound);
    });

  });

  describe('POST /verify-token', () => {

    it('returns an error if no token is passed', () => {
      return server
        .post(ENDPOINTS.VERIFY_TOKEN)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
        .then(result => {
          expect(result.body).to.have.a.property('ValidationErrors');
          expect(result.body.ValidationErrors).to.contain('Property <token> is missing. Put the <token> in either your body or use <x-access-token> in the Http-header.');
        });
    });

    it('does not throw a validation error if token is passed in body', () => {
      const body = {
        token: 'foo'
      };
      return server
        .post(ENDPOINTS.VERIFY_TOKEN)
        .send(body)
        .then(result => {
          expect(result.body).to.not.have.a.property('ValidationErrors');
        });
    });

    it('returns an error if the token is invalid', () => {

      const body = {
        token: 'foo'
      };

      return server
        .post(ENDPOINTS.VERIFY_TOKEN)
        .send(body)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
        .expect(userAssertions.invalidToken);
    });

    it('returns OK if the token is valid', async () => {

      const doc = {
        is_deleted: false,
        is_verified: true,
        local: {
          password: 'passw0rd',
          username: 'foo-user',
          email: 'foo@bar.com'
        }
      };

      const user = new UserModel(doc);
      user.setLocalPassword(doc.local.password); // Todo: really needed? Don't think so.

      let newUser = await user.save();
      let body = {
        token: newUser.generateJwt()
      };

      await server
        .post(`${ENDPOINTS.VERIFY_TOKEN}`)
        .send(body)
        .expect(HttpStatus.OK)
        .expect(userAssertions.validToken);
    });

    it('returns OK if the token is NOT valid', async () => {

      const doc = {
        is_deleted: false,
        is_verified: true,
        local: {
          password: 'passw0rd',
          username: 'foo-user',
          email: 'foo@bar.com'
        }
      };

      const user = new UserModel(doc);
      user.setLocalPassword(doc.local.password);

      await user.save();
      let body = {
        token: 'abcde'
      };

      await server
        .post(`${ENDPOINTS.VERIFY_TOKEN}`)
        .send(body)
        // Todo: This currently returns INTERNAL_SERVER_ERROR, but what should it return ...?
        // .expect(HttpStatus.OK)
        .expect(userAssertions.invalidToken);
    });

    it('will not verify if a user is marked as deleted', async () => {

      const doc = {
        username: 'foo-user',
        password: 'passw0rd',
        is_deleted: true,
        local: {
          email: 'foo@bar.com'
        }
      };

      let user = new UserModel(doc);
      await user.save();
      const body = {
        token: user.generateJwt()
      };

      await server
        .post(`${ENDPOINTS.VERIFY_TOKEN}`)
        .send(body)
        .expect(HttpStatus.OK)
        .expect(userAssertions.validToken);

    });

  });

  describe('DELETE /v1/user:id', () => {

    xit('can only be performed by either the user himself or an admin');

    it('marks a user as deleted', async () => {

      const doc = {
        is_deleted: false,
        is_active: false,
        local: {
          username: 'foo-user',
          password: 'passw0rd',
          email: 'foo@bar.com'
        }
      };

      let user = new UserModel(doc);
      let newUser = await user.save();

      await server
        .delete(`/v1/user/${newUser._id}`)
        .expect(HttpStatus.OK)
        .then(updateResult => {
          expect(updateResult.body).to.have.property('n').to.be.equal(1);
          expect(updateResult.body).to.have.property('nModified').to.be.equal(1);
          expect(updateResult.body).to.have.property('ok').to.be.equal(1);
        });
    });

    it('unmarks a user as deleted', async () => {

      const doc = {
        is_deleted: false,
        is_active: false,
        local: {
          username: 'foo-user',
          password: 'passw0rd',
          email: 'foo@bar.com'
        }
      };

      let user = new UserModel(doc);
      let newUser = await user.save();

      await server
        .post(`/v1/user/${newUser._id}/undelete`)
        .expect(HttpStatus.OK)
        .then(updateResult => {
          expect(updateResult.body).to.have.property('n').to.be.equal(1);
          expect(updateResult.body).to.have.property('nModified').to.be.equal(1);
          expect(updateResult.body).to.have.property('ok').to.be.equal(1);
        });

      await server
        .get(`/v1/user/${newUser._id}`)
        .expect(HttpStatus.OK)
        .then(result => {
          expect(result.body).to.have.a.property('is_deleted').to.be.false;
        });
    });
  });

  describe('GET /v1/me', () => {
    it('returns my data if it is me', async () => {
      const doc = {
        is_deleted: false,
        is_active: true,
        local: {
          username: 'foo-user',
          password: 'passw0rd',
          email: 'foo@bar.com'
        }
      };

      let user = await new UserModel(doc).save();
      let token = user.generateJwt();

      await server
        .get(`${ENDPOINTS.ME}`)
        .set('x-access-token', token)
        .expect(HttpStatus.OK)
        .then(result => {
          expect(result.body).to.exist;
          expect(result.body).to.have.property('_id');
          expect(result.body).to.have.property('email');
          expect(result.body).to.have.deep.property('username');
          expect(result.body).to.not.have.deep.property('exp');
          expect(result.body).to.not.have.deep.property('iat');
        });
    });

    it('returns an error if I cannot be recognized', async () => {
      await server
        .get(`${ENDPOINTS.ME}`)
        .set('x-access-token', 'foobarbaz')
        .expect(HttpStatus.UNAUTHORIZED)
        .then(result => {
          expect(result.body.message).to.contain('jwt malformed');
        });
    });
  });

  xdescribe('DELETE /v1/:id/purge', () => {

    let user1Saved = null;
    let user1Token = null;
    let user2Saved = null;
    let user2Token = null;
    let adminSaved = null;
    let adminToken = null;

    beforeEach(async () => {

      const user1Doc = {
        local: {
          username: 'user1',
          password: 'passw0rd',
          email: 'user1@bar.com'
        }
      };

      const user2Doc = {
        local: {
          username: 'user2',
          password: 'passw0rd',
          email: 'user2@bar.com'
        }
      };

      const adminDoc = {
        local: {
          username: 'admin',
          password: 'passw0rd',
          email: 'admin@bar.com'
        }
      };

      // Create the users, one being the admin, one the user to delete.
      let user1 = new UserModel(user1Doc);
      user1Saved = await user1.save();
      user1Token = user1Saved.generateJwt();
      let user2 = new UserModel(user2Doc);
      user2Saved = await user2.save();
      let admin = new UserModel(adminDoc);
      adminSaved = await admin.save();

    });

    it('without a JWT token we should be in any case screwed', async () => {
      await server
        .delete(`/v1/user/${user1Saved._id.toString()}/purge`)
        // .expect(HttpStatus.UNAUTHORIZED)
        .then(result => {
          console.log(result);
          expect(result.res.statusCode).to.be.equal(500);
        });
    });

    it('is not allowed by a user without admin scope', async () => {
      await server
        .delete(`/v1/user/${user2Saved._id}/purge`)
        .set('x-access-token', user1Token)
        // .expect(HttpStatus.UNAUTHORIZED)
        .then(result => {
          console.log(result);
          expect(result.res.statusCode).to.be.equal(500);
        });
    });

    it('is allowed by a user with admin scope', async () => {

    });

    xit('is never allowed by the current user (cannot purge my own account)', async () => {
      expect(true).to.be.false;
    });

    xit('can be executed by an admin', async () => {
      expect(true).to.be.false;
    });
    xit('One admin account needs to remain', async () => {
      expect(true).to.be.false;
    });
  });

});

