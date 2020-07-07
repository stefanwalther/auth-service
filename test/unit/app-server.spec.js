const AppServer = require('../../src/app-server');

describe('[unit] => app-server', () => {

  let server = null;

  afterEach(() => {
    return server.stop();
  });

  it('does not throw an error if no config is provided', () => {

    let fn = function () {
      server = new AppServer();
    };
    expect(fn).to.not.throw();

  });
  it('throws an error if a bad port is passed', () => {
    let fn = function () {
      server = new AppServer({PORT: 'abc'});
    };
    expect(fn).to.throw(Error, 'PORT is not a number: abc');
  });
});
