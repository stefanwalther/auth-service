const AppServer = require('./../../src/api/app-server');

describe('app-server', () => {

  it('ctor => throws an error if the port is invalid', () => {
    try {
      const appServer = new AppServer({PORT: 'abc'});
    } catch (e) {
      expect(e).to.exist;
      expect(e).to.have.a.property('message').to.contain('PORT is not a number');
    }
  });

});
