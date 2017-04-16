const bodyParser = require('body-parser');

module.exports = {
  configure: app => {
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
  }
};
