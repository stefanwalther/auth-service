// Todo: Should be removed
const HttpStatusCodes = require('http-status-codes');
const logger = require('winster').instance();

module.exports = app => {
  app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
      logger.trace('we have an unauthorized error');
      res.status(HttpStatusCodes.UNAUTHORIZED);
      res.json({message: err.name + ': ' + err.message}); // Todo: part of the consolidation and standardization of errors.
    }
    next();
  });
};
