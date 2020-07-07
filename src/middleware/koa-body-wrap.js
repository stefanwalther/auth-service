const _ = require('lodash');

module.exports = bodyWrap;

function bodyWrap() {
  return function (ctx, next) {
    return next().then(() => setBodyWrap(ctx));
  };
}

function setBodyWrap(ctx) {
  if (!_.isEmpty(ctx.body)) {
    ctx.body.data = Object.assign({}, ctx.body);
  }
}
