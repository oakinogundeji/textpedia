/**
 * Module dependencies
 */
//=============================================================================
const
  os = require('os'),
  cr8search = require('../utils/cr8search'),
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
  return res.status(200).json('Got it!');
});
router.post('/confirm', function (req, res) {
  console.log('confirm data from vue', req.body.data);
  return res.status(200).json('Got it!');
});
//Messaging API Routes
router.post('/messaging_inbound', function (req, res) {
  //Handles inbound msgs from Twilio
  console.log('data from Twilio', req.body);
  /*var
    p_num = req.body.From,
    k_words = req.body.Body;
    console.log('SMS from:', p_num);
    console.log('with kwords', k_words);
    cr8search(p_num, k_words);*/
  return res.type('text/xml').status(200).send(INBOUND_RESP);
});
router.post('/scrape', function (req, res) {
  var
    p_num = req.body.From,
    k_words = req.body.Text;
  console.log('SMS from:', p_num);
  console.log('with kwords', k_words);
  cr8search(p_num, k_words);
  return res.status(200).json('Got it!');
});
//=============================================================================
/**
 * Export Module
 */
//=============================================================================
module.exports = router;
//=============================================================================
