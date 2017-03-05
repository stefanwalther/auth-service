const mongoose = require('mongoose');
const timeStamps = require('mongoose-timestamp');
const Schema = mongoose.Schema;

const mongooseConfig = require('./../../config/mongoose-config');

const schema = new Schema({

}, {
  collection: mongooseConfig.COLLECTION_PREFIX + '_user-audit',
  strict: true
});

schema.index({username: 1, email: 1});
schema.plugin(timeStamps, {createdAt: 'created_at', updatedAt: 'updated_at'});

module.exports = {
  Schema: schema,
  Model: mongoose.model('user-audit', schema)
};
