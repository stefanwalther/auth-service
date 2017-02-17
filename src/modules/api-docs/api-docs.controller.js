const HttpStatus = require('http-status-codes');
const swaggerJsDocs = require('swagger-jsdoc');


const pkg = require('./../../../package.json');

const opts = {
  swaggerDefinition: {
    info: {
      title: 'auth-service',
      version: pkg.version
    },
  },
  apis: [
    './src/modules/api-docs/api-docs.routes.js'
  ]
};

class ApiDocsController {

  static getDocs() {
    return swaggerJsDocs(opts);
  }

  static getRaw(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(ApiDocsController.getDocs());
    res.status(HttpStatus.OK);
  }

}

module.exports = ApiDocsController;
