const AppServer = require('./../../src/api/app-server');

describe('app-server', () => {
  it('does not throw an error if no config is provided', () => {

    let fn = function () {
      let a = new AppServer();
    };
    expect(fn).to.not.throw();

  });
  it('throws an error if a bad port is passed', () => {
    let fn = function () {
      let a = new AppServer({PORT: 'abc'});
    };
    expect(fn).to.throw(Error, 'PORT is undefined or not a number: abc');
  });
});
