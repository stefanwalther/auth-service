const HttpStatus = require('http-status-codes');
const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET;

module.exports = async (ctx, next) => {

  if (!ctx.headers['x-access-token']) {
    ctx.status = HttpStatus.UNAUTHORIZED;
    ctx.body = {message: 'No token'};
    return;
  }
  const token = ctx.headers['x-access-token'];

  try {
    ctx.request.jwtPayload = jwt.verify(token, secret);
  } catch (err) {
    ctx.throw(err.status || 403, err.text);
  }

  await next();
};
