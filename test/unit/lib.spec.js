const lib = require('./../../src/api/lib/utils');

describe('[UNIT] => lib', () => {

  describe('eMailInDomain()', () => {

    it('filters a domain (wildcard or empty)', () => {
      expect(lib.eMailInDomain('', 'foo@bar.com')).to.be.true;
      expect(lib.eMailInDomain('*', 'foo@bar.com')).to.be.true;
    });

    it('filters a domain (included, string)', () => {
      expect(lib.eMailInDomain('bar.com', 'foo@bar.com')).to.be.true;
    });

    it('filters a domain (included, delimited-string)', () => {
      expect(lib.eMailInDomain('bar.com,baz.com', 'foo@bar.com')).to.be.true;
    });

    it('filters a domain (included, dirty delimited-string)', () => {
      expect(lib.eMailInDomain(' bar.com , baz.com ', 'foo@bar.com')).to.be.true;
    });

    it('filters a domain (excluded, string)', () => {
      expect(lib.eMailInDomain('baz.com', 'foo@bar.com')).to.be.false;
    });

    it('filters a domain (excluded, delimited-string)', () => {
      expect(lib.eMailInDomain('foo.com,baz.com', 'foo@bar.com')).to.be.false;
    });

  });
});
