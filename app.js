
/**
 * Module dependencies.
 */

var express = require('express')
	, http = require('http')
  , request = require('request');

var routes = require('./routes')
  , user = require('./routes/user')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var Mongoose = require('mongoose');
var db = Mongoose.createConnection('localhost', 'tidbits');

var UserSchema = require('./models/User.js').UserSchema;
var User = db.model('users', UserSchema);

var OrderSchema = require('./models/Order.js').OrderSchema;
var Order = db.model('orders', OrderSchema);

var TradeSchema = require('./models/Trade.js').TradeSchema;
var Trade = db.model('trades', TradeSchema);

app.get('/', routes.index);
app.get('/users', user.list);

app.post('/order', function(req, res) {
  if (req.body.side) {
    if (req.body.side == "Buy") {

    } else if (req.body.side == "Sell") {

    } else {
      res.json({ error : 'Invalid side ' + req.body.side });
    }
  } else {
    res.json({ error : 'No side specified' });
  }
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
