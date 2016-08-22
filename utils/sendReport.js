'use strict';
/**
 * Module dependencies
 */
//=============================================================================
const
  os = require('os'),
  nodemailer = require('nodemailer'),
  sgTransport = require('nodemailer-sendgrid-transport'),
  messaging_send = require('./messaging_send');
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
module.exports = function (email, report, p_num) {
  const msg = {
    to: email,
    from: 'research@textpedia.com',
    subject: 'Your research results',
    text: 'Hi, ' + os.EOL + os.EOL +'Thanks for using the Textpedia service, your' +
      ' research results are:' + os.EOL + os.EOL + report
  };
  //send email
  mailer.sendMail(msg, function(err, res) {
    if(err) {
      return console.error(err);
      }
      return console.log(res);
  });
  //send SMS
  return messaging_send(p_num);
};
//=============================================================================
