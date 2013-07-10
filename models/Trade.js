/**
 *  Order.js
 *
 *  Created on: July 10, 2013
 *      Author: Valeri Karpov
 *
 *  Mongoose model for orders
 *
 */

var Mongoose = require('mongoose');

exports.TradeSchema = new Mongoose.Schema({
  buy : { type : Mongoose.Schema.ObjectId, ref : 'users' },
  sell : { type : Mongoose.Schema.ObjectId, ref : 'users' },
  price : { type : Number, required : true },
  quantity : { type : Number, required : true },
  expiry : { type : Date, required : true },
  created : { type : Date, default : Date.now }
});