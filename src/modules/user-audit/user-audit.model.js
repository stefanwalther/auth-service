const mongoose = require('mongoose');
const timeStamps = require('mongoose-timestamp');
const Schema = mongoose.Schema;

const mongooseConfig = require('./../../config/mongoose-config');

const schema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  event: {
    type: String,
    default: '<event:empty>'
  },
  message: {
    type: String,
    default: '<message:empty>'
  }
}, {
  collection: mongooseConfig.COLLECTION_PREFIX + '_user-audit',
  strict: true
});

schema.index({username: 1, email: 1});
schema.plugin(timeStamps, {createdAt: 'created_at', updatedAt: 'updated_at'});
const UserAuditModel = mongoose.model('user-audit', schema);

// Todo: Doesn't make sense without allowing to save a custom event
schema.statics.save = user => {
  const newRec = new UserAuditModel(user);
  return newRec.save().exec();
};

module.exports = {
  Schema: schema,
  Model: UserAuditModel
};
