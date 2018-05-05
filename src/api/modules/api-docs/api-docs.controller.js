const HttpStatus = require('http-status-codes');
const swaggerJsDocs = require('swagger-jsdoc');

const swaggerConfig = require('./../../config/swagger-config');

class ApiDocsController {

  static getDocs(/* req, res */) {
    return swaggerJsDocs(swaggerConfig);
  }

  static getRaw(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(ApiDocsController.getDocs());
    res.status(HttpStatus.OK);
  }
}

module.exports = ApiDocsController;
