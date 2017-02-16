const AppServer = require('./../../src/app-server');

describe('AppServer', () => {

  let server = null;
  beforeEach(() => {
    server = new AppServer();
  });

  afterEach(() => {
    return server.stop();
  });

  it('has a method start', () => {
    expect(server).to.have.property('start').to.be.a.method;
  });
  it('has a method stop', () => {
    expect(server).to.have.property('stop').to.be.a.method;
  });

});
