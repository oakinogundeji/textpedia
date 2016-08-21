'use strict';
/**
 * Module dependencies
 */
//=============================================================================
const
  cr8search = require('./cr8search'),
  User = require('../models/users');
//=============================================================================
/**
 * Export Module
 */
//=============================================================================
module.exports = function (p_num, k_words) {
  User.findOne({phoneNumber: p_num}, function (err, user) {
    if(err) {
      console.log('There was an error accessing the db');
      console.error(err);
      throw err;
    }
    else if(!user) {
      console.log('User with phone number %s not registered', p_num);
      return null;
    }
    else {
      console.log('The user exists in the dBase');
      return cr8search(p_num, k_words);
    }
  });
};
//=============================================================================
