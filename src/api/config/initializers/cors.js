const cors = require('cors');

module.exports = {
  configure: app => {
    app.use(cors());
  }
};
