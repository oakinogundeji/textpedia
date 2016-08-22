'use strict';
/**
 * Module dependencies
 */
//=============================================================================
const
  isRegistered = require('../utils/isRegistered'),
  cr8User = require('../utils/cr8User'),
  confirmToken = require('../utils/confirmToken'),
  express = require('express'),
  router = express.Router(),
  jwt = require('jsonwebtoken');
//=============================================================================
/**
 * Module variables
 */
//=============================================================================
const INBOUND_RESP = '<?xml version="1.0" encoding="UTF-8" ?>' +
  '<Response></Response>';
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
  const
    EMAIL = req.body.data.email,
    PHONE_NUM = req.body.data.phoneNumber;
  return cr8User(EMAIL, PHONE_NUM, res);
});
router.post('/confirm', function (req, res) {
  var phone_num;
  jwt.verify(req.body.data.jwt, process.env.TokenSecret, function (err, token) {
    if(err) {
      console.log('There was an error verifying the JWT');
      console.error(err);
      throw err;
    }
    else {
      if(Date.now() - new Date(token.time).getTime() <= 5 * 60 * 1000) {
        const TOKEN = req.body.data.token;
        return confirmToken(TOKEN, token.phone_num, res);
      }
      else {
        return res.status(403).json('retry in 2 hours');
      }
    }
  });
});
//Messaging API Routes
router.post('/messaging_inbound', function (req, res) {
  //Handles inbound msgs from Twilio
  var
    p_num = req.body.From,
    k_words = req.body.Body;
    isRegistered(p_num, k_words);
  return res.type('text/xml').status(200).send(INBOUND_RESP);
});
//=============================================================================
/**
 * Export Module
 */
//=============================================================================
module.exports = router;
//=============================================================================
