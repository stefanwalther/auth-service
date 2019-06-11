
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

module.exports = {
  randomString
};
