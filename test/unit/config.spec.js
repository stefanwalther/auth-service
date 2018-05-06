const AppServer = require('./../../src/api/app-server');
const _ = require('lodash');

describe('AppServer => unit tests', () => {

  let server = null;

  afterEach(async () => {
    await server.stop();
  });

  describe('Config PORT', () => {

    it('has a default value', () => {
      server = new AppServer();
      expect(server.config).to.have.property('PORT');
      expect(_.toNumber(server.config.PORT)).to.be.equal(3010);
    });

    it('can be changed (by passing a param)', () => {
      server = new AppServer({PORT: 2002});
      expect(server.config).to.have.property('PORT').to.be.equal(2002);
    });

    // Todo: this cannot work as the ./server-config.js is already loaded, so it will not be re-evaluated again
    //       to get this working, we have to make bigger changes ...
    xit('can be changed (by changing the env variable)', () => {
      process.env.PORT = 2003;
      server = new AppServer();
      expect(server.config).to.have.property('PORT');
      expect(_.toNumber(server.config.PORT)).to.be.a('number');
      expect(_.toNumber(server.config.PORT)).to.be.equal(2003);
    });

    xit('passing a value overrides the env variable');
  });
});
