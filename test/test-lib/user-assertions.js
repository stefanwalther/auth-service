
module.exports = {
  hasToken: res => {
    expect(res.body).to.have.property('token');
    expect(res.body.token).to.exist;
  }
};
