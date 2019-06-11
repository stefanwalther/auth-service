module.exports = {
  app: {
    title: 'auth-service',
    emailFrom: 'spam@walthers.me',
    emailReply: 'spam@walthers.me'
  },
  registration: {
    isActiveDefault: true,
    isDeletedDefault: false,
    local: {
      isEmailVerifiedDefault: false,
      sendActivationMail: true
    },
    verificationUrl: 'http://localhost:4002/verify/?code=::code::'
  }
};
