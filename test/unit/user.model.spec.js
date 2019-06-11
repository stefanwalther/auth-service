const UserModel = require('./../../src/api/modules/user/user.model').Model;

// Todo: Get more out of it: https://codeutopia.net/blog/2016/06/10/mongoose-models-and-unit-tests-the-definitive-guide/
describe('UserModel => unit tests', () => {

  xit('returns an error if username is too short', done => {

    const doc = {
      local: {
        password: 'foobarbaz',
        username: 'foo',
        email: 'foo@bar.com'
      }
    };

    const userModel = new UserModel(doc);
    userModel.validate(err => {
      expect(err.errors).to.have.a.property('local.username');
      expect(err.errors['local.username']).to.deep.include({message: 'Username too short, 4 characters required.'});
      done();
    });
  });

  xit('throws an error if `email` is not unique', async () => {

    const tenantId = mongoose.Types.ObjectId().toString();

    const userDoc1 = {
      tenant_id: tenantId,
      local: {
        password: 'bar',
        username: 'foofoo',
        email: 'foo@bar.com'
      }
    };

    new UserModel(userDoc1).save();

    const userDoc2 = {
      tenant_id: tenantId,
      local: {
        password: 'bar',
        username: 'foofoo',
        email: 'foo@bar.com'
      }
    };

    new UserModel(userDoc2).save()
      .catch(err => {
        expect(err).to.exist;
      });

  });

});
