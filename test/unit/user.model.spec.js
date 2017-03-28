const UserModel = require('./../../src/api/modules/user/user.model').Model;

// Todo: Get more out of it: https://codeutopia.net/blog/2016/06/10/mongoose-models-and-unit-tests-the-definitive-guide/
describe('UserModel => unit tests', () => {

  // Todo: Use promises: http://stackoverflow.com/questions/9222376/testing-mongoosejs-validations
  it('returns errors for required fields', done => {
    const userModel = new UserModel();
    userModel.validate(err => {
      expect(err.errors).to.exist;
      expect(err.errors).to.have.a.property('username');
      expect(err.errors).to.have.a.property('local.email');
      done();
    });
  });

  it('returns an error if username is too short', done => {

    const doc = {
      username: 'foo',
      password: 'foobarbaz',
      local: {
        email: 'foo@bar.com'
      }
    };

    const userModel = new UserModel(doc);
    userModel.validate(err => {
      expect(err.errors).to.have.a.property('username');
      expect(err.errors.username).to.deep.include({message: 'Username too short, 6 characters required.'});
      done();
    });
  });

});
