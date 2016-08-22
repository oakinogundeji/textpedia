'use strict';
/**
 * Module dependencies
 */
//=============================================================================
const
  os = require('os'),
  nodemailer = require('nodemailer'),
  sgTransport = require('nodemailer-sendgrid-transport');
//=============================================================================
/**
 * Module variables
 */
//=============================================================================
const
  sgtOptions = {
    auth: {
        api_user: process.env.SendGridUsername,
        api_key: process.env.SendGridPassword
      }
    },
  mailer = nodemailer.createTransport(sgTransport(sgtOptions));
//=============================================================================
/**
 * Export Module
 */
//=============================================================================
module.exports = function (email, txtp_phone_num) {
  const msg = {
    to: email,
    from: 'welcome@textpedia.com',
    subject: 'Welcome to Textpedia',
    text: 'Hi, ' + os.EOL + os.EOL +'You have successfully signed up to use the' +
      ' Textpedia service. The end-point phone number to send keywords to is: ' + txtp_phone_num +
      '. Please save this number on your phone\'s address book. If you lose this number, ' +
      'you will have to re-register for the service. We wish you a profitable experience' +
      ' using Textpedia.' + os.EOL + os.EOL + 'The Textpedia Team.'
  };
  //send email
  mailer.sendMail(msg, function(err, res) {
    if(err) {
      return console.error(err);
      }
      return console.log(res);
  });
};
//=============================================================================
