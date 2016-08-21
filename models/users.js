'use strict';
/**
*Module dependencies
*/
//-----------------------------------------------------------------------------
const mongoose = require('mongoose');
//=============================================================================
/**
*User schema
*/
//-----------------------------------------------------------------------------
var UserSchema = mongoose.Schema({
    email: {
      type: String,
      required: true
      },
    phoneNumber: {
      type: String,
      unique: true,
      required: true
    },
    active: {
      type: Boolean,
      required: true,
      default: false
    },
    temp_token: {
      value: {
        type: String,
        unique: true
      },
      time: {
        type: Date,
        default: Date.now
      }
    }
  });
//=============================================================================
/**
*Create user model
*/
//-----------------------------------------------------------------------------
var UserModel = mongoose.model('User', UserSchema);
//==============================================================================
/**
*Export user model
*/
//-----------------------------------------------------------------------------
module.exports = UserModel;
//==============================================================================
