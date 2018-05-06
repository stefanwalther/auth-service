const HttpStatus = require('http-status-codes');
const swaggerJsDocs = require('swagger-jsdoc');

const swaggerConfig = require('./../../config/swagger-config');

class ApiDocsController {

  /**
   * @private
   */
  static getDocs(/* req, res */) {
    return swaggerJsDocs(swaggerConfig);
  }

  /**
   * /api-docs/raw
   */
  static getRaw(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(ApiDocsController.getDocs());
    res.status(HttpStatus.OK);
  }
}

module.exports = ApiDocsController;
