/**
 * Module dependencies
 */
//=============================================================================
const sendNumber = require('./sendNumber');
var User = require('../models/users');
//=============================================================================
/**
 * Export Module
 */
//=============================================================================
module.exports = function (token, p_num, res) {
  User.findOne({phoneNumber: p_num}, function (err, user) {
    if(err) {
      console.log('There was a dB access error in retrieving the user');
      console.error(err);
      throw err;
    }
    const USR_TOKEN = user.temp_token.value;
    if(token == USR_TOKEN) {
      console.log('Token confirmed', token);
      console.log('sent token', USR_TOKEN);
      user.active = true;
      console.log('user status set to active', user);
      user.temp_token.value = '';
      console.log('temp creds deleted', user);
      console.log('sending endpt number to user email');
      sendNumber(user.email, process.env.TWILIOLivePhoneNumber);
      return res.status(200).json('All good!');
    }
    else {
      console.log('token does not match', token);
      console.log('sent token', USR_TOKEN);
      return res.status(403).json('retry in 2 hours');
    }
  });
};
//=============================================================================
