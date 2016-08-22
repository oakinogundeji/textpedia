'use strict';
/**
 * Module dependencies
 */
//=============================================================================
const
  sendToken = require('./sendToken'),
  User = require('../models/users'),
  jwt = require('jsonwebtoken');
//=============================================================================
/**
 * Module variables
 */
//===========================================================================
function generateRandomToken() {
  var
    date = new Date().getTime(),
    xterBank = 'abcdefghijklmnopqrstuvwxyz',
    fstring = '',
    i;
  for(i = 0; i < 15; i++) {
    fstring += xterBank[parseInt(Math.random()*26)];
  }
  return (fstring += date);
}

function cr8NewUser(p_num, email, res) {
  let newUser = new User();
  newUser.phoneNumber = p_num;
  newUser.email = email;
  newUser.active = false;
  newUser.temp_token = {
    value: generateRandomToken(),
    time: Date.now()
  };
  newUser.save(function (err, user) {
    if(err) {
      console.log('There was an error saving the created user');
      console.error(err);
      throw err;
    }
    else {
      const JWT = jwt.sign({
        phone_num: user.phoneNumber,
        time: Date.now()
      }, process.env.TokenSecret);
      return sendToken(user.temp_token.value, user.email, JWT, res);
    }
  });
}
//=============================================================================
/**
 * Export module
 */
//=============================================================================
module.exports = function (email, p_num, res) {
  User.findOne({phoneNumber: p_num}, function (err, user) {
    if(err) {
      console.log('There was a db access error');
      console.error(err);
      throw err;
    }
    if(user && (Date.now() - new Date(user.temp_token.time).getTime() <  2 * 60 * 60 * 1000)) {
      return res.status(409).json('Phone number already in use!');
    }
    else if(user && (Date.now() - new Date(user.temp_token.time).getTime() >=  2 * 60 * 60 * 1000)) {
      user.remove(function (err) {
        if(err) {
          console.log('There was an error removing old user record from dB');
          console.error(err);
          throw err;
        }
        return cr8NewUser(p_num, email, res);
      });
    }
    else {
      return cr8NewUser(p_num, email, res);
    }
  });
};
//=============================================================================
