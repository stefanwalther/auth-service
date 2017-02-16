const Server = require('./../../src/app-server');

describe('Auth-Service', () => {

  let server = null;
  beforeEach(() => {
    server = new Server();
    return server.start();
  });

  afterEach(() => {
    return server.stop();
  });

  it('test it', () => {
    expect(true).to.be.true;
  })

});
