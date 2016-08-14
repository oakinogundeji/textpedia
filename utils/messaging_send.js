/**
 * Module Dependencies
 */
//=============================================================================
const
  plivo = require('plivo'),
  config = require('../config/config'),
  p = plivo.RestAPI({
  authId: config.plivo.ID,
  authToken: config.plivo.token
});
//=============================================================================
/**
 * Module variables
 */
//=============================================================================
const
  src = config.plivo.src,
  send_url = config.plivo.send_url,
  mthd = 'GET';
//=============================================================================
/**
 * Export Module
 */
//=============================================================================
module.exports = function (p_num) {
  send_params = {
    'src': src, // Sender's phone number with country code
    'dst': p_num, // Receiver's phone Number with country code
    'text': "Hi, your research results have been sent to your email address." +
      "Thank you for using the Textpedia service.", // Your SMS Text Message - English
    //'text' : "こんにちは、元気ですか？", // Your SMS Text Message - Japanese
    //'text' : "Ce est texte généré aléatoirement", // Your SMS Text Message - French
    'url': send_url, // The URL to which with the status of the message is sent
    'method': mthd // The method used to call the url
};
  // Prints the complete response
  p.send_message(send_params, function (status, resp) {
      console.log('Status: ', status);
      console.log('API Response:\n', resp);
      console.log('Message UUID:\n', resp['message_uuid']);
      console.log('Api ID:\n', resp['api_id']);
  });
};
//=============================================================================
