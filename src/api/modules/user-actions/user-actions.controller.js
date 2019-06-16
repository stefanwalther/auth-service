const HttpStatus = require('http-status-codes');
const path = require('path');
const Email = require('email-templates');
const nodemailer = require('nodemailer');
const nodeMailerPostmarkTransport = require('nodemailer-postmark-transport');

const UserModel = require('./../../modules/user/user.model').Model;
const logger = require('winster').instance();
const serverConfig = require('./../../config/server-config');
const appSettings = require('./../../config/app-settings');

class UserActionsController {

  static async sendVerificationEmail(req, res) {

    const email = req.body.email;
    const user = await UserModel.findOne({
      'local.email': email
    });
    if (user) {
      try {
        await _sendVerificationEmail(user);
      } catch (err) {
        logger.verbose('Error when sending the verification email', err);
        return res.status(HttpStatus.UNPROCESSABLE_ENTITY).json(err);
      }
    } else {
      res.setHeader('Content-Type', 'application/json');
      return res.status(HttpStatus.NOT_FOUND).json({message: 'No user could be found with the given email address.'});
    }
  }
}

const transport = nodemailer.createTransport(
  nodeMailerPostmarkTransport({
    auth: {
      apiKey: serverConfig.POSTMARK_API_TOKEN
    }
  })
);

async function _sendVerificationEmail(user) {

  const pathTemplates = path.join(__dirname, './../../emails');

  const email = new Email({
    message: {
      from: appSettings.app.emailFrom
    },
    send: true,
    transport,
    views: {
      root: pathTemplates,
      options: {
        extension: 'hbs'
      }
    }
  });

  return email
    .send({
      template: 'verification',
      message: {
        to: user.local.email
      },
      locals: {
        user,
        verificationUrl: appSettings.registration.verificationUrl
          .replace('::code::', user.local.email_verification_code)
          .replace('::email::', user.local.email)
          .replace('::username::', user.local.username),
        app: appSettings.app
      }
    })
    .then(result => {
      logger.verbose('send mail results', result);
    })
    .catch(err => {
      logger.error('Error sending the mail', err);
    });
}

module.exports = UserActionsController;
