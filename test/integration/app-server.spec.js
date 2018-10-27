const AppServer = require('./../../src/api/app-server');

describe('[integration] app-server', () => {

  // Todo: should be moved to unit tests
  it('ctor => throws an error if the port is invalid', () => {

    let fn = function () {
      let a = new AppServer({PORT: 'abc'});
    };
    expect(fn).to.throw(Error, 'PORT is not a number: abc');
  });
});
