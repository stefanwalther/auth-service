
module.exports = {
  hasNoToken: result => {
    expect(result.body).to.not.have.a.deep.property('token');
  },
  hasToken: result => {
    expect(result.body).to.have.property('token');
    expect(result.body.token).to.exist;
  },
  invalidToken: result => {
    expect(result.body).to.exist;
    expect(result.body).to.have.a.property('message').to.be.equal('Invalid token.');
  },
  validToken: result => {
    expect(result.body).to.exist;
    expect(result.body).to.have.a.property('message').to.be.equal('Valid token.');
  },
  userNotFound: result => {
    expect(result.body).to.exist;
    expect(result.body).to.contain.a.property('message', 'User not found.');
  },
  userDeactivated: result => {
    expect(result.body).to.exist;
    expect(result.body).to.contain.a.property('message', 'User not active.');
  },
  userDeletedCannotBeActivated: result => {
    expect(result.body).to.exist;
    expect(result.body).to.contain.a.property('message', 'A deleted user cannot be set to active.');
  },
  userDeletedCannotBeDeactivated: result => {
    expect(result.body).to.exist;
    expect(result.body).to.contain.a.property('message', 'A deleted user cannot be set to inactive.');
  },
  emailNotVerified: result => {
    expect(result.body).to.exist;
    expect(result.body).to.contain.a.property('message', 'Email not verified.');
  },
  hasNoPassword: result => {
    expect(result.body).to.not.contain.a.deep.property('password');
  },
  hasNoVerfificationToken: result => {
    expect(result.body).to.exist;
    expect(result.body).to.not.contain.a.deep.property('email_verification_code');
  },
  local: {
    isNotVerified: result => {
      expect(result.body).to.exist;
    }
  }
};
