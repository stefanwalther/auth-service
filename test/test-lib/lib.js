const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cfg = require('./../../src/config/jwt-config');
const moment = require('moment');
const UserModel = require('./../../src/modules/user/user.model').Model;

class TestLib {

  // ---------------------------------------------------------------------------
  // General
  // ---------------------------------------------------------------------------
  static getDummyUid() {
    return mongoose.Types.ObjectId();
  }

  // ---------------------------------------------------------------------------
  // Users
  // ---------------------------------------------------------------------------
  static async addDummyUser() {
    const u1 = {
      tenant_id: mongoose.Types.ObjectId().toString(),
      local: {
        username: 'foo-1',
        email: 'foo-1@bar.com',
        password: 'baz-1'
      }
    };
    let user1 = await new UserModel(u1).save();

    return {
      user1
    };
  }

  static async addDummyUsers() {
    const u1 = {
      tenant_id: mongoose.Types.ObjectId().toString(),
      local: {
        username: 'foo-1',
        email: 'foo-1@bar.com',
        password: 'baz-1'
      }
    };
    let user1 = await new UserModel(u1).save();
    const u2 = {
      tenant_id: mongoose.Types.ObjectId().toString(),
      local: {
        username: 'foo-2',
        email: 'foo-2@bar.com',
        password: 'baz-2'
      }
    };
    let user2 = await new UserModel(u2).save();

    return {
      user1,
      user2
    };
  }

  // ---------------------------------------------------------------------------
  // JWT Token Handle
  // ---------------------------------------------------------------------------
  static getToken(payload) {
    const pl = Object.assign({
      exp: moment().add(7, 'days').valueOf()
    }, payload);

    return jwt.sign(pl, cfg.JWT_SECRET);
  }

  static get DUMMY_TOKENS() {
    return {
      any: {
        user_id: mongoose.Types.ObjectId(),
        firstname: 'John',
        lastname: 'Doe'
      },
      alicia: {
        user_id: mongoose.Types.ObjectId('5ecd77c1e6476e3a43ed01d8'),
        firstname: 'Alicia',
        lastname: 'Over'
      },
      max: {
        user_id: mongoose.Types.ObjectId('5ecd77c1e6476e3a43ed01dd'),
        firstname: 'Max',
        lastname: 'Mustermann'
      }
    };

  }
}

module.exports = TestLib;
