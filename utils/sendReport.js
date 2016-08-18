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
  testEmail = 'oakinogundeji@gmail.com',
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
module.exports = function (report, p_num) {
  const email = {
    to: testEmail,
    from: 'research@textpedia.com',
    subject: 'Your research results',
    text: 'Hi, ' + os.EOL + os.EOL +'Thanks for using the Textpedia service, your' +
      ' research results are:' + os.EOL + os.EOL + report
  };
  //send email
  mailer.sendMail(email, function(err, res) {
    if(err) {
      console.log('There was an error sending the report');
      console.error(err);
      }
      console.log('The report was successfully sent');
      console.log(res);
  });
  //send SMS
  messaging_send(p_num);
};
//=============================================================================
