const HttpStatus = require('http-status-codes');
const swaggerJsDocs = require('swagger-jsdoc');

const swaggerConfig = require('../../config/swagger-config');

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
  static getRaw(ctx) {
    ctx.status = HttpStatus.OK;
    ctx.body = ApiDocsController.getDocs();
  }
}

module.exports = ApiDocsController;
