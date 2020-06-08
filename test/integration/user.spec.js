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
  ME: '/v1/me',
  PATCH_USER: '/v1/user/:id',
  VERIFY_EMAIL_BY_ID: '/v1/user/:userId/actions/verify-with-id/:code',
  VERIFY_EMAIL_BY_USERIDENTIFIER: '/v1/user/:IdOrEmail/actions/verify/:code'
};

describe('[integration] auth-service => user', () => {

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

    it('provides a tenant_id by default', async () => {

      let user1 = new UserModel({
        local: {
          password: 'test',
          email: 'test@bar.com',
          username: 'test'
        }
      });
      await user1.save();

      expect(user1).to.have.property('_id').to.not.be.empty;
      expect(user1).to.have.property('tenant_id').to.not.be.empty;

    });

    // Todo: We potentially have a problem here, or at least we have to think about it:
    //  - Is a user unique globally
    //  - Is a user only unique within a tenant
    //  - If we start validating by tenant, it should be possible to have the same username/email in several tenants
    it('registering a new user throws an error if user already exists', async () => {

      let user1 = new UserModel({
        tenant_id: mongoose.Types.ObjectId().toString(),
        local: {
          password: 'test',
          email: 'test@bar.com',
          username: 'test'
        }
      });
      await user1.save();

      let user2 = new UserModel({
        tenant_id: mongoose.Types.ObjectId().toString(),
        local: {
          password: 'test',
          email: 'test@foobar.com',
          username: 'test'
        }
      });

      try {
        await user2.save();
      } catch (e) {
        console.log(e);
        expect(e).to.exist;
        expect(e.name).to.be.equal('ValidationError');
      }
    });

    it('is fine registering multiple users (with different usernames)', async () => {

      let user1 = new UserModel({
        tenant_id: mongoose.Types.ObjectId().toString(),
        local: {
          username: 'foo',
          email: 'foo@bar.com',
          password: 'test'
        }
      });
      let u = await user1.save();

      let user2 = new UserModel({
        tenant_id: mongoose.Types.ObjectId().toString(),
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
        tenant_id: mongoose.Types.ObjectId().toString(),
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

  describe('POST `/user/register/local`', () => {

    it('does not throw an error if domainValidation equals *', async () => {
      const doc = {};
      await server
        .post(ENDPOINTS.REGISTER_LOCAL)
        .send(doc)
        // .expect(HttpStatus.UNPROCESSABLE_ENTITY)
        .then(result => {
          expect(result.body).to.have.a.property('ValidationErrors');
          expect(result.body.ValidationErrors).to.contain('Property <local.email> missing.');
        });
    });

    it('throws validation errors for required fields', async () => {

      const doc = {};
      await server
        .post(ENDPOINTS.REGISTER_LOCAL)
        .send(doc)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)
        .then(result => {
          expect(result.body).to.have.a.property('ValidationErrors');
          expect(result.body.ValidationErrors).to.contain('Property <local.username> missing.');
          expect(result.body.ValidationErrors).to.contain('Property <local.password> missing.');
          expect(result.body.ValidationErrors).to.contain('Property <local.email> missing.');
        });
    });

    it('creates a new user', () => {

      const doc = {
        tenant_id: mongoose.Types.ObjectId().toString(),
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
        // .then(result => {
        //   console.log('result', result.body);
        // })
        .expect(userAssertions.hasNoToken)
        .expect(userAssertions.hasNoVerfificationToken);
    });

    it('creates a new user with the appropriate defaults', () => {

      const doc = {
        tenant_id: mongoose.Types.ObjectId().toString(),
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
        .expect(userAssertions.hasNoVerfificationToken);

    });

    it('does not return any sensitive information', () => {
      const doc = {
        tenant_id: mongoose.Types.ObjectId().toString(),
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

    it('does not allow to set sensitive information');

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
          expect(result.body.ValidationErrors).to.contain('Property <emailOrUsername> missing.');
          expect(result.body.ValidationErrors).to.contain('Property <password> missing.');
        });
    });

    it('returns 401/Unauthorized if login fails (no user found)', () => {
      const doc = {
        emailOrUsername: 'foo-user',
        password: 'passw0rd'
      };
      return server
        .post(ENDPOINTS.USER_LOGIN)
        .send(doc)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('returns 401/Unauthorized if login fails (user found, password does not match)', () => {

      const user = {
        tenant_id: mongoose.Types.ObjectId().toString(),
        local: {
          username: 'foo-user',
          password: 'passw0rd',
          email: 'foo@bar.com'
        }
      };

      const login = {
        emailOrUsername: 'foo-user',
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

    it('does return a token if successfully logged in (log-in with `username`)', () => {

      const doc = {
        is_active: true,
        tenant_id: mongoose.Types.ObjectId().toString(),
        local: {
          username: 'foo-user',
          email: 'foo@bar.com',
          password: 'passw0rd',
          email_verified: true
        }
      };

      const newUser = new UserModel(_.clone(doc));

      return newUser.save()
        .then(() => {
          return server
            .post(ENDPOINTS.USER_LOGIN)
            .send({
              emailOrUsername: doc.local.username,
              password: doc.local.password
            })
            .expect(HttpStatus.OK)
            // .then(result => {
            //   console.log(result.body);
            // })
            .expect(userAssertions.hasToken);
        });
    });

    it('does return a token if successfully logged in (log-in with `email`)', () => {

      const doc = {
        is_active: true,
        tenant_id: mongoose.Types.ObjectId().toString(),
        local: {
          username: 'foo-user',
          email: 'foo@bar.com',
          password: 'passw0rd',
          email_verified: true
        }
      };

      const newUser = new UserModel(_.clone(doc));

      return newUser.save()
        .then(() => {
          return server
            .post(ENDPOINTS.USER_LOGIN)
            .send({
              emailOrUsername: doc.local.email,
              password: doc.local.password
            })
            .expect(HttpStatus.OK)
            .expect(userAssertions.hasToken);
        });
    });

    it('will not allow deactivated users to login', async () => {

      const doc = {
        tenant_id: mongoose.Types.ObjectId().toString(),
        is_deleted: false,
        is_active: false,
        local: {
          username: 'foo-user',
          password: 'passw0rd',
          email: 'foo@bar.com',
          email_verified: true
        }
      };

      let user = new UserModel(doc);
      await user.save();

      await server
        .post('/v1/user/login')
        .send({
          emailOrUsername: doc.local.username,
          password: doc.local.password
        })
        .expect(HttpStatus.UNAUTHORIZED)
        .expect(userAssertions.userNotFound);
    });

    it('should not allow non-verified users to login', async () => {
      const doc = {
        tenant_id: mongoose.Types.ObjectId().toString(),
        is_deleted: false,
        is_active: true,
        local: {
          username: 'foo-user',
          password: 'passw0rd',
          email: 'foo@bar.com'
        }
      };

      let user = new UserModel(doc);
      await user.save();

      await server
        .post('/v1/user/login')
        .send({
          emailOrUsername: doc.local.username,
          password: doc.local.password
        })
        .expect(HttpStatus.UNAUTHORIZED)
        .expect(userAssertions.emailNotVerified);
    });

    it('will not allow deleted users to login', async () => {

      const doc = {
        tenant_id: mongoose.Types.ObjectId().toString(),
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
          emailOrUsername: doc.local.username,
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
        tenant_id: mongoose.Types.ObjectId().toString(),
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
        tenant_id: mongoose.Types.ObjectId().toString(),
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

  });

  describe('Using the user cache, verify-token', () => {

    xit('will not verify if a user is marked as deleted', async () => {

      const doc = {
        tenant_id: mongoose.Types.ObjectId().toString(),
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
        .expect(userAssertions.invalidToken);

    });

    xit('will not verify if a user is not active', async () => {

      const doc = {
        tenant_id: mongoose.Types.ObjectId().toString(),
        username: 'foo-user',
        password: 'passw0rd',
        is_active: false,
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
        .expect(userAssertions.invalidToken);
    });

    xit('will not verify if a user is not verified', async () => {
      const doc = {
        tenant_id: mongoose.Types.ObjectId().toString(),
        username: 'foo-user',
        password: 'passw0rd',
        is_active: true,
        is_verified: false,
        is_deleted: false,
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
        .expect(userAssertions.invalidToken);
    });

  });

  describe('DELETE /v1/user/:id', () => {

    xit('can only be performed by either the user himself or an admin');

    it('marks a user as deleted', async () => {

      const doc = {
        tenant_id: mongoose.Types.ObjectId().toString(),
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
        tenant_id: mongoose.Types.ObjectId().toString(),
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
          // Console.log(updateResult.body);
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
        tenant_id: mongoose.Types.ObjectId().toString(),
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

  xdescribe('PATCH /v1/user/:id', () => {
    it('should allow to patch the roles', async () => {

      const user = {
        tenant_id: mongoose.Types.ObjectId().toString(),
        local: {
          password: 'bar',
          username: 'foofoo',
          email: 'foo@bar.com'
        }
      };

      await server
        .post(ENDPOINTS.REGISTER_LOCAL)
        .send(user)
        .expect(HttpStatus.CREATED)
        .then(result => {
          console.log('created user', result.body);
          expect(result.body).to.exist;
        });

      // Const userModified = {
      //   roles: ['role1', 'role2']
      // };
      //
      // await server
      //   .patch(ENDPOINTS.PATCH_USER.replace(':id', user._id))
      //   .send(userModified)
      //   .expect(HttpStatus.NO_CONTENT);
      //
      // await server
      //   .get(ENDPOINTS.ME)
      //   .expect(HttpStatus.OK)
      //   .then(result => {
      //
      //   });
    });

    it('should throw an error if not performed by a user being admin', async () => {

    });
  });

  describe('PUT `/v1/user/:id/actions/verify/:code', () => {

    it('should verify a user by the `userId` and allow login', async () => {
      const doc = {
        tenant_id: mongoose.Types.ObjectId().toString(),
        is_deleted: false,
        is_verified: true,
        local: {
          password: 'passw0rd',
          username: 'foo-user',
          email: 'foo@bar.com'
        }
      };
      let user = await new UserModel(doc).save();

      await server
        .post(ENDPOINTS.USER_LOGIN)
        .send({
          emailOrUsername: doc.local.username,
          password: doc.local.password
        })
        .expect(HttpStatus.UNAUTHORIZED);

      await server
        .put(ENDPOINTS.VERIFY_EMAIL_BY_ID.replace(':userId', user._id).replace(':code', user.local.email_verification_code))
        .expect(HttpStatus.OK);

      await server
        .post(ENDPOINTS.USER_LOGIN)
        .send({
          emailOrUsername: doc.local.username,
          password: doc.local.password
        })
        .expect(HttpStatus.OK);
    });

    it('should verify a user by `username` and allow login', async () => {
      const doc = {
        tenant_id: mongoose.Types.ObjectId().toString(),
        is_deleted: false,
        is_verified: true,
        local: {
          password: 'passw0rd',
          username: 'foo-user',
          email: 'foo@bar.com'
        }
      };
      let user = await new UserModel(doc).save();

      await server
        .post(ENDPOINTS.USER_LOGIN)
        .send({
          emailOrUsername: doc.local.username,
          password: doc.local.password
        })
        .expect(HttpStatus.UNAUTHORIZED);

      await server
        .put(ENDPOINTS.VERIFY_EMAIL_BY_USERIDENTIFIER.replace(':IdOrEmail', user.local.username).replace(':code', user.local.email_verification_code))
        .expect(HttpStatus.OK);

      await server
        .post(ENDPOINTS.USER_LOGIN)
        .send({
          emailOrUsername: doc.local.username,
          password: doc.local.password
        })
        .expect(HttpStatus.OK);
    });

    it('should verify a user by `email` and allow login', async () => {

      const doc = {
        tenant_id: mongoose.Types.ObjectId().toString(),
        is_deleted: false,
        is_verified: true,
        local: {
          password: 'passw0rd',
          username: 'foo-user',
          email: 'foo@bar.com'
        }
      };
      let user = await new UserModel(doc).save();

      await server
        .post(ENDPOINTS.USER_LOGIN)
        .send({
          emailOrUsername: doc.local.username,
          password: doc.local.password
        })
        .expect(HttpStatus.UNAUTHORIZED);

      await server
        .put(ENDPOINTS.VERIFY_EMAIL_BY_USERIDENTIFIER.replace(':IdOrEmail', user.local.email).replace(':code', user.local.email_verification_code))
        .expect(HttpStatus.OK);

      await server
        .post(ENDPOINTS.USER_LOGIN)
        .send({
          emailOrUsername: doc.local.username,
          password: doc.local.password
        })
        .expect(HttpStatus.OK);

    });

  });

});

