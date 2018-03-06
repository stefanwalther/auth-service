const HttpStatusCodes = require('http-status-codes');

module.exports = app => {
  app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
      console.log('we have an unauthorized error');
      res.status(HttpStatusCodes.UNAUTHORIZED);
      res.json({message: err.name + ': ' + err.message}); // Todo: part of the consolidation and standardization of errors.
    }
    next();
  });
};
