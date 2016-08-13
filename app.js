/**
 * Import Module Dependencies
 */
//=============================================================================
const
  express = require('express'),
  logger = require('morgan'),
  bParser = require('body-parser'),
  compression = require('compression'),
  path = require('path'),
  config = require('./config/config'),
  ejsLayout = require('express-ejs-layouts'),
  mongoose = require('mongoose');
//=============================================================================
/**
 * Create Express App
 */
//=============================================================================
const app = express();
//=============================================================================
/**
 * Module variables
 */
//=============================================================================
const
  port = process.env.port || 3030,
  env = config.env,
  host = config.host,
  dBURL = config.dBURL,
  routes = require('./routes/routes');
var db;
//=============================================================================
/**
 * App config and settings
 */
//=============================================================================
require('clarify')
app.disable('x-powered-by');
app.set('port', port);
app.set('env', env);
app.set('host', host);
app.set('views', path.join(__dirname, '/views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('layout', 'layout');
//=============================================================================
/**
 * dBase connection
 */
//=============================================================================
mongoose.connect(dBURL);
db = mongoose.connection;
db.on('error', function (err) {
  console.error('There was a db connection error');
  return  console.error(err.message);
});
db.once('connected', function () {
  return console.log('Successfully connected to ' + dBURL);
});
db.once('disconnected', function () {
  return console.error('Successfully disconnected from ' + dBURL);
});
process.on('SIGINT', function () {
  mongoose.connection.close(function () {
    console.error('dBase connection closed due to app termination');
    return process.exit(0);
  });
});
//=============================================================================
/**
 * Middleware Stack
 */
//=============================================================================
app.use(logger('dev'));
app.use(bParser.json());
app.use(bParser.urlencoded({extended: true}));
app.use(ejsLayout);
app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));
//=============================================================================
/**
 * Routes
 */
//=============================================================================
app.get('/test', function (req, res) {
  return res.status(200).
    send('<marquee><h1>Yaaaay... it works!!!</h1></marquee>');
});
app.use('/', routes);
//=============================================================================
/**
 * Export Module
 */
//=============================================================================
module.exports = app;
//=============================================================================
