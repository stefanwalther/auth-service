const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cfg = require('./../../src/config/jwt-config');
const moment = require('moment');

class TestLib {

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
