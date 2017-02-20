const HttpStatusCodes = require('http-status-codes');

app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(HttpStatusCodes.UNAUTHORIZED);
    res.json({"message" : err.name + ": " + err.message}); // Todo: part of the consolidation and standardization of errors.
  }
});
