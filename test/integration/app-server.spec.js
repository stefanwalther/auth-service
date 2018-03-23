const AppServer = require('./../../src/api/app-server');

describe('app-server', () => {

  it('ctor => throws an error if the port is invalid', () => {

    let fn = function () {
      let a = new AppServer({PORT: 'abc'});
    };
    expect(fn).to.throw(Error, 'PORT is undefined or not a number: abc');
  });

});
