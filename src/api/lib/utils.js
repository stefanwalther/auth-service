const _ = require('lodash');

// Taken from: https://stackoverflow.com/questions/10726909/random-alpha-numeric-string-in-javascript
/**
 * Usage:
 *  randomString(16, 'aA');
 *  randomString(32, '#aA');
 *  randomString(64, '#A!');
 * @param length
 * @param chars
 * @returns {string|string}
 */
function randomString(length, chars) {
  let mask = '';
  if (chars.indexOf('a') > -1) {
    mask += 'abcdefghijklmnpqrstuvwxyz';
  }
  if (chars.indexOf('A') > -1) {
    mask += 'ABCDEFGHIJKLMNPQRSTUVWXYZ';
  }
  if (chars.indexOf('#') > -1) {
    mask += '123456789';
  }
  if (chars.indexOf('!') > -1) {
    mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
  }
  let result = '';
  for (let i = length; i > 0; --i) {
    result += mask[Math.floor(Math.random() * mask.length)];
  }
  return result;
}

function validateEmail(email) {
  // eslint-disable-next-line no-useless-escape
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

/**
 * Validates if an eMail is from one or more given domains, which is given by the parameter `allowedDomains`.
 *
 * @description Note, this function does not validate the eMail itself. Do this before calling this method.
 *
 * @param allowedDomains {string} - The domain(s) to be used to validate the eMail against. Can be either a wildcard ("*"), a
 * single domain ("domain1.com") or a list of domains ("domain1.com,domain2.com,domain3.com").
 * @param eMail {string} - The eMail address to check.
 * @returns {boolean} - Whether the eMail is amongst the list of given domains.
 */
function eMailInDomain(allowedDomains, eMail) {
  if (_.isEmpty(allowedDomains) || _.trim(allowedDomains) === '*') {
    return true;
  }
  if (!eMail || _.isEmpty(eMail)) {
    throw new Error('email cannot be null or empty');
  }
  const allowedDomainsArray = allowedDomains.split(',');
  for (let i = 0; i < allowedDomainsArray.length; i++) {
    let item = _.trim(allowedDomainsArray[i]);
    // Console.log(`check eMail <${eMail}></eMail> against item: <${item}>`);
    if (eMail.endsWith(item)) {
      return true;
    }
  }
  return false;
}

module.exports = {
  eMailInDomain,
  validateEmail,
  randomString
};
