const AppServer = require('./../../src/app-server');

describe('app-server', () => {

  xit('start => throws an error if the port is invalid', () => {
    const appServer = new AppServer({PORT: 'abc'});
    return appServer.start()
      .catch(err => {
        expect(err).to.exist;
      });
  });

});
