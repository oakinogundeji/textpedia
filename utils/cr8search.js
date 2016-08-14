/**
 * Module dependencies
 */
//=============================================================================
const
  cp = require('child_process'),
  sendReport = require('./sendReport');
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
module.exports = function (p_num, k_words) {
  console.log('scrape user phone number %s', p_num);
  console.log('scrape keyword', k_words);
  //NB child_process pattern is 'cmd, [file_path, args.....]'
  var
    words = k_words.split(','),
    args = [SCRAPER_PATH].concat(words),
    scraper = cp.spawn('python3', args),
    chunk = '';

  scraper.stdout.on('data', function (data) {
    chunk += data
  });
  scraper.stdout.on('close', function () {
    console.log('scraper finished sending data');
    console.log('data =', chunk);
    //return sendReport(chunk, p_num);
  });
  scraper.stderr.on('data', function (err) {
    console.log('there was an err with scraper');
    return console.error(err.toString());
  });
};
//=============================================================================
