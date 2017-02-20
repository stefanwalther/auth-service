const UserModel = require('./../../src/modules/user/user.model').Model;

describe('UserModel => unit tests', () => {

  // Todo: Use promises: http://stackoverflow.com/questions/9222376/testing-mongoosejs-validations
  it('returns errors for required fields', done => {
    const userModel = new UserModel();
    userModel.validate(err => {
      expect(err.errors).to.exist;
      expect(err.errors).to.have.a.property('username');
      expect(err.errors).to.have.a.property('email');
      done();
    });
  });

  it('returns an error if username is too short', done => {

    const doc = {
      username: 'foo',
      email: 'foo@bar.com',
      password: 'foobarbaz'
    };

    const userModel = new UserModel(doc);
    userModel.validate(err => {
      expect(err.errors).to.have.a.property('username');
      expect(err.errors.username).to.deep.include({message: 'Username too short, 6 characters required.'});
      done();
    });
  });

});
