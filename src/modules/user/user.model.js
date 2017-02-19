const mongoose = require('mongoose');

const MongooseConfig = require('./../../config/mongoose-config');
const Schema = mongoose.Schema;

/* eslint-disable camelcase */
const schema = new Schema({
  name: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ['fatal', 'error', 'debug', 'warn', 'data', 'info', 'verbose', 'trace'],
    default: 'info'
  },
  message: {
    type: Object
  },
  ts: {
    type: Date,
    default: new Date()
  }
}, {
  collection: MongooseConfig.COLLECTION_PREFIX + MongooseConfig.COLLECTION_JOBS,
  strict: true
});
/* eslint-enable camelcase */

module.exports = {
  Schema: schema,
  Model: mongoose.model(MongooseConfig.COLLECTION_JOBS, schema)
};

