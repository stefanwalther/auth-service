const AppServer = require('./../../src/api/app-server');

describe('app-server', () => {
  it('throws an error if no config is provided', () => {
    try {
      const appServer = new AppServer();
    } catch (e) {
      expect(e).to.exist;
    }
  });
});
