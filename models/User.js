/**
 *  User.js
 *
 *  Created on: July 10, 2013
 *      Author: Valeri Karpov
 *
 *  Mongoose model for users
 *
 */

var Mongoose = require('mongoose');

exports.UserSchema = new Mongoose.Schema({
  email : { type : String, required : true },
  username { type : String }
});