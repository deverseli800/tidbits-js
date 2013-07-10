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

exports.OrderSchema = new Mongoose.Schema({
  user : { type : Mongoose.Schema.ObjectId, ref : 'users' },
  price : { type : Number, required : true },
  quantity : { type : Number, required : true },
  side : { type : String, enum : ["Buy", "Sell"], required : true },
  expiry : { type : Date, required : true },
  created : { type : Date, default : Date.now }
});