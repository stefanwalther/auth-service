const AppServer = require('./../../src/api/app-server');

describe('app-server', () => {

  // Todo: Bullshit, does not work
  // Todo: Furthermore the server needs to be stopped at every test, otherwise we'll get an EADIRINUSE
  xit('ctor => throws an error if the port is invalid', () => {
    try {
      const appServer = new AppServer({PORT: 'abc'});
    } catch (e) {
      expect(e).to.exist;
      expect(e).to.have.a.property('message').to.contain('PORT is not a number');
    }
  });

});
