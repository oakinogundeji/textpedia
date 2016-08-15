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
  acctSID = config.twilio.liveAccountSid,
  authToken = config.twilio.liveAuthToken,
  sender = config.twilio.livePhoneNumber,
  client = new twilio.RestClient(acctSID, authToken);
//=============================================================================
/**
 * Export Module
 */
//=============================================================================
module.exports = function (k_word, p_num) {
  const send_params = {
    'to': p_num, // Sender's phone number with country code
    'from': sender, // Receiver's phone Number with country code
    'body': "Hi, your keyword search for '" + k_word + "' didn't return any result." +
      " Please verify that you're using the proper keywords, then try again." +
      " Thank you for using the Textpedia service."
};
  // Prints the complete response
  client.messages.create(send_params, function (err, resp) {
    if(err) {
      console.log('There was an error sending the message via Twilio');
      return console.error(err);
    }
    else {
      console.log('The response from Twilio');
      return console.log(resp);
    }
  });
};
//=============================================================================
