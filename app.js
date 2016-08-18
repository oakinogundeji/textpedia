'use strict';
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
  port = process.env.PORT || 3030,
  env = config.env,
  routes = require('./routes/routes');
var
  db,
  dBURL;
//=============================================================================
/**
 * App config and settings
 */
//=============================================================================
require('clarify');
app.disable('x-powered-by');
app.set('port', port);
app.set('env', env);
app.set('views', path.join(__dirname, '/views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('layout', 'layout');
//=============================================================================
/**
 * dBase connection
 */
//=============================================================================
if(!process.env.NODE_ENV) {
  dBURL = config.dBURL;
}
else {
  dBURL = process.env.dBURL;
}
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
 * Custom Error Handler
 */
//=============================================================================
app.use(function (err, req, res, next) {
  console.error(err.stack);
  return res.status(500).render('pages/errors');
});
//=============================================================================
/**
 * Export Module
 */
//=============================================================================
module.exports = app;
//=============================================================================
