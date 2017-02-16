process.env.NODE_ENV = 'test';
if (process.env.CIRCLECI !== 'true') {
  process.env.SAMMLER_DB_URI_LOGS = 'mongodb://localhost:27018/logs';
}
global.expect = require('chai').expect;

