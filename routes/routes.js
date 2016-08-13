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
//API Routes
router.post('/scrape', function (req, res) {
  cr8search(req.body.p_num, req.body.k_words);
  return res.status(200).json('Got it!');
});
//=============================================================================
/**
 * Export Module
 */
//=============================================================================
module.exports = router;
//=============================================================================
