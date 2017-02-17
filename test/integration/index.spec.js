const AppServer = require('./../../src/app-server');

describe('auth-service', () => {

  let server = null;
  beforeEach(() => {
    server = new AppServer();
    return server.start();
  });

  afterEach(() => {
    return server.stop();
  });

  it('test it', () => {
    expect(true).to.be.true;
  });

  it('test it', () => {
    expect(true).to.be.true;
  });

  it('test it', () => {
    expect(true).to.be.true;
  });

});
