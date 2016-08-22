'use strict';
/**
 * Module Dependencies
 */
//=============================================================================
const
  twilio = require('twilio'),
  config = require('../config/config');
//=============================================================================
/**
 * Module variables
 */
//=============================================================================
const
  acctSID = process.env.TWILIOLiveAccountSid,
  authToken = process.env.TWILIOLiveAuthToken,
  sender = process.env.TWILIOLivePhoneNumber,
  client = new twilio.RestClient(acctSID, authToken);
//=============================================================================
/**
 * Export Module
 */
//=============================================================================
module.exports = function (p_num) {
  const send_params = {
    'to': p_num, // Sender's phone number with country code
    'from': sender, // Receiver's phone Number with country code
    'body': "Hi, your research results have been sent to your email address." +
      " Thank you for using the Textpedia service."
};
  // Prints the complete response
  client.messages.create(send_params, function (err, resp) {
    if(err) {
      return console.error(err);
    }
    else {
      return console.log(resp);
    }
  });
};
//=============================================================================
