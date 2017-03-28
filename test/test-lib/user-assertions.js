
module.exports = {
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
    expect(result.body).to.contain.a.property('message', 'User not found');
  }
};
