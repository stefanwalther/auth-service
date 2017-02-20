const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');
const path = require('path');
const emailTemplates = require('email-templates');

const nodeMailerConfig = require('./../../config/nodemailer-config.js');
const templatesDir = path.join(__dirname, './../../mailtemplates');

// Todo: Define the vertifcationUrl
const vertificationUrl = '';

const options = {
  auth: {
    api_user: nodeMailerConfig.api_user,
    api_key: nodeMailerConfig.api_key
  }
};
const mailer = nodemailer.createTransport(sgTransport(options));

function sendVerificationMail(user, callback) {

  const verificationUrl = vertificationUrl.replace(':user_id', user._id).replace(':token', user.verification_token);

  emailTemplates(templatesDir, (err, template) => {

    if (err) {
      return callback(err);
    }

    template('verification', {user, verificationUrl}, (err, html, text) => {

      if (err) {
        return callback(err);
      }

      mailer.sendMail({
        to: [user.email],
        from: nodeMailerConfig.from,
        bcc: nodeMailerConfig.bcc,
        subject: 'Activation of your account',
        text,
        html
      }, (err, res) => {
        if (err) {
          return callback(err);
        }
        return callback(null, res);
      });
    });
  });

}

module.exports = {
  sendVerificationMail
};
