process.env.NODE_ENV = 'test';
process.env.WINSTER_SUPRESS_LOGGING = 'true';

// If (process.env.CIRCLECI !== 'true') {
//
// }

global.expect = require('chai').expect;

