const UserModel = require('./user.model').Model;
// const logger = require('winster').instance();

class UserBL {

  static markAsDeleted(id) {

    return UserModel
      .update(
        {_id: id},
        {$set: {is_deleted: true}}
      )
      .exec();
  }

  static unMarkAsDeleted(id) {
    return UserModel
      .update(
        {_id: id},
        {$set: {is_deleted: false}}
      )
      .exec();
  }

  static getById(id) {
    return UserModel
      .findById(id)
      .exec();
  }

  static getDeleted() {

    return UserModel
      .find({is_deleted: true})
      .exec();

  }

}

module.exports = UserBL;
