const AppServer = require('../../src/app-server');

describe('[unit] AppServer', () => {

  let server = null;
  beforeEach(() => {
    server = new AppServer({PORT: 2000});
  });

  afterEach(() => {
    return server.stop();
  });

  it('has a method start', () => {
    expect(server).to.have.property('start');
    expect(server.start).to.be.a('function');
  });
  it('has a method stop', () => {
    expect(server).to.have.property('stop');
    expect(server.stop).to.be.a('function');
  });

});
