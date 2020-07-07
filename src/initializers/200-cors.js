const koaCors = require('koa2-cors');

module.exports = {
  priority: 200,
  execute(app) {
    app.use(
      koaCors({
        allowedMethods: ['GET', 'POST', 'PATCH', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
      })
    );
  }
};
