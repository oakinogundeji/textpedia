'use strict';
/**
 * Module dependencies
 */
//=============================================================================
const
  cr8search = require('../utils/cr8search'),
  cr8User = require('../utils/cr8User'),
  express = require('express'),
  router = express.Router();
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
  console.log('submit data from vue', req.body.data);
  const
    EMAIL = req.body.data.email,
    PHONE_NUM = req.body.data.phoneNumber;
  return cr8User(EMAIL, PHONE_NUM, res);
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
