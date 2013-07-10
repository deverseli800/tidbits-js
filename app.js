
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

app.get('/:username', function(req, res) {
  User.findOne({ username : req.params.username }, function(error, user) {
    if (error || !user) {
      res.json({ error : 'User ' + req.params.username + ' not found' });
    } else {
      res.render('index', { user : user });
    }
  });
});
app.get('/users', user.list);

app.get('/new/user/:username/:email', function(req, res) {
  var u = new User({ username : req.params.username, email : req.params.email });
  u.save(function(error, user) {
    if (error || !user) {
      res.json({ error : error });
    } else {
      res.json({ user : user });
    }
  });
});

app.post('/order', function(req, res) {
  var o = new Order(req.body);
  o.validate(function(error) {
    if (error) {
      res.json({ error : 'Invalid order' });
    } else {
      if (req.body.side == "Buy") {
        Order.
            find({ expiry : req.body.expiry, price : { $lte : req.body.price }, quantity : { $gte : req.body.quantity }, side : "Sell" }).
            sort('price', 1).
            sort('created', -1).
            exec(function(error, orders) {
              if (orders.length > 0) {
                var trade = new Trade({ buy : o.user, sell : orders[0].user, price : orders[0].price, quantity : o.quantity, expiry : o.expiry });
                var insertedTrade = false;
                var savedOrder = false;

                trade.save(function(error, trade) {
                  if (savedOrder) {
                    res.json({ matched : true, trade : trade });
                  } else {
                    insertedTrade = true;
                  }
                });

                orders[0].quantity -= o.quantity;
                if (orders[0].quantity == 0) {
                  orders[0].remove(function(error) {
                    if (insertedTrade) {
                      res.json({ matched : true, trade : trade });
                    } else {
                      savedOrder = true;
                    }
                  });
                } else {
                  orders[0].save(function(error, order) {
                    if (insertedTrade) {
                      res.json({ matched : true, trade : trade });
                    } else {
                      savedOrder = true;
                    }
                  });
                }
              } else {
                o.save(function(error, order) {
                  res.json({ matched : false, order : order });
                });
              }
            });
      } else if (req.body.side == "Sell") {
        Order.
            find({ expiry : req.body.expiry, price : { $gte : req.body.price }, quantity : { $gte : req.body.quantity }, side : "Buy" }).
            sort('price', -1).
            sort('created', -1).
            exec(function(error, orders) {
              if (orders.length > 0) {
                var trade = new Trade({ sell : o.user, buy : orders[0].user, price : orders[0].price, quantity : o.quantity, expiry : o.expiry });
                var insertedTrade = false;
                var savedOrder = false;

                trade.save(function(error, trade) {
                  if (savedOrder) {
                    res.json({ matched : true, trade : trade });
                  } else {
                    insertedTrade = true;
                  }
                });

                orders[0].quantity -= o.quantity;
                if (orders[0].quantity == 0) {
                  orders[0].remove(function(error) {
                    if (insertedTrade) {
                      res.json({ matched : true, trade : trade });
                    } else {
                      savedOrder = true;
                    }
                  });
                } else {
                  orders[0].save(function(error, order) {
                    if (insertedTrade) {
                      res.json({ matched : true, trade : trade });
                    } else {
                      savedOrder = true;
                    }
                  });
                }
              } else {
                o.save(function(error, order) {
                  res.json({ matched : false, order : order });
                });
              }
            });
      } else {
        res.json({ error : 'Invalid side ' + req.body.side });
      }
    }
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
