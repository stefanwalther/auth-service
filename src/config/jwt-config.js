
// Todo: We could think of some validation at startup if the secret key is not defined as env-variable.
module.exports = {
  JWT_SECRET: process.env.JWT_SECRET
};
