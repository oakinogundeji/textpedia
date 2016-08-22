'use strict';
/**
 * Module dependencies
 */
//=============================================================================
const
  cp = require('child_process'),
  sendReport = require('./sendReport'),
  sendCorrection = require('./sendCorrection');
//=============================================================================
/**
 * Module variables
 */
//=============================================================================
const
  SCRAPER_PATH = __dirname + '/scraper/scraper.py';
//=============================================================================
/**
 * Export Module
 */
//=============================================================================
module.exports = function (email, p_num, k_words) {
  //NB child_process pattern is 'cmd, [file_path, args.....]'
  const
    words = k_words.split(','),
    args = [SCRAPER_PATH].concat(words),
    scraper = cp.spawn('python3', args);
  let chunk = '';

  scraper.stdout.on('data', function (data) {
    chunk += data
  });
  scraper.stdout.on('close', function () {
    if(chunk.trim() == 'poor keyword') {
      return sendCorrection(k_words, p_num);
    }
    else {
      return sendReport(email, chunk, p_num);
    }
  });
  scraper.stderr.on('data', function (err) {
    console.log('there was an err with scraper');
    return console.error(err.toString());
  });
};
//=============================================================================
