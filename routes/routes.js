'use strict';
/**
 * Module dependencies
 */
//=============================================================================
const
  cr8search = require('../utils/cr8search'),
  sendToken = require('../utils/sendToken'),
  express = require('express'),
  router = express.Router();
var User = require('../models/users');
//=============================================================================
/**
 * Module variables
 */
//=============================================================================
const INBOUND_RESP = '<?xml version="1.0" encoding="UTF-8" ?>' +
  '<Response></Response>';

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
      console.log('new user successfully created', user);
      return sendToken(user.temp_token.value, user.email, res);
    }
  });
}
//=============================================================================
/**
 * Routes
 */
//=============================================================================
//UI Routes
router.get('/', function (req, res) {
  return res.status(200).render('pages/index')
});
router.post('/submit', function (req, res) {
  console.log('submit data from vue', req.body.data);
  const
    EMAIL = req.body.data.email,
    PHONE_NUM = req.body.data.phoneNumber;
  User.findOne({phoneNumber: PHONE_NUM}, function (err, user) {
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
          console.log('There was an error removinf old user record from dB');
          console.error(err);
          throw err;
        }
        return cr8NewUser(PHONE_NUM, EMAIL, res);
      });
    }
    else {
      return cr8NewUser(PHONE_NUM, EMAIL, res);
    }
  });
});
router.post('/confirm', function (req, res) {
  console.log('confirm data from vue', req.body.data);
  return res.status(200).json('Got it!');
});
//Messaging API Routes
router.post('/messaging_inbound', function (req, res) {
  //Handles inbound msgs from Twilio
  var
    p_num = req.body.From,
    k_words = req.body.Body;
    cr8search(p_num, k_words);
  return res.type('text/xml').status(200).send(INBOUND_RESP);
});
//=============================================================================
/**
 * Export Module
 */
//=============================================================================
module.exports = router;
//=============================================================================
