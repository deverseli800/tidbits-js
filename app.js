
/**
 * Module dependencies.
 */

var express = require('express')
	, http = require('http')
  , io = require('socket.io-client')
  , MailChimpAPI = require('mailchimp').MailChimpAPI
  , request = require('request');

var routes = require('./routes')
  , user = require('./routes/user')
  , path = require('path');

var Coinbase = require('./routes/tools/Coinbase.js').Coinbase;

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

var coinbase2 = new Coinbase(request,
    { clientId : 'd83375543a57d859221a56c78485dde9bddfea41999ea90ac74787b28075c02f',
      clientSecret : 'ea155548bf07e32a2d8bdb23c31fb3b657675086e42fccf709f9def7c70ae06b'
    });

var apiKey = process.env.APIKEY || "bf62be61fba4984a1d627a30270de0717a345beea9a2c39681f28382c552290a";

var mailchimp = new MailChimpAPI(process.env.MAILCHIMP || "684a49b024c94f7303ee51ccbfc23c64-us7", { version : '1.3' });
mailchimp.listId = process.env.MAILCHIMPLISTID || '94e1f79540';

var coinbase = {
  requestBitcoins : function(email, amount, callback) {
    request.post({ url : 'https://coinbase.com/api/v1/transactions/request_money?api_key=' + apiKey,
        json : { from : email, amount : amount, notes : "Tidbits" } },
        function(error, response, body) {
          if (body.success) {
            callback(null, true);
          } else {
            callback({ error : body }, null);
          }
        });
  },
  sendBitcoins : function(email, amount, callback) {
    request.post({ url : 'https://coinbase.com/api/v1/transactions/send_money?api_key=' + apiKey,
        json : { to : email, amount : amount, notes : "Tidbits" } },
        function(error, response, body) {
          if (body.success) {
            callback(null, true);
          } else {
            callback({ error : body }, null);
          }
        });
  }
};

var mtGox = {};
mtGox.lastBBO = { bid : 0, ask : 0 };

// Point a socket to Mt Gox's streaming API
var socket = io.connect('https://socketio.mtgox.com/mtgox');
socket.on('message', function(message) {
  if (message.channel_name == "ticker.BTCUSD") {
    mtGox.lastBBO.bid = message.ticker.buy.value;
    mtGox.lastBBO.ask = message.ticker.sell.value;
  }
});

var Mongoose = require('mongoose');
var db = Mongoose.createConnection('localhost', 'tidbits');

var UserSchema = require('./models/User.js').UserSchema;
var User = db.model('users', UserSchema);

var OrderSchema = require('./models/Order.js').OrderSchema;
var Order = db.model('orders', OrderSchema);

var TradeSchema = require('./models/Trade.js').TradeSchema;
var Trade = db.model('trades', TradeSchema);

app.get('/graphs/:username', function(req, res) {
  User.findOne({ username : req.params.username }, function(error, user) {
    if (error || !user) {
      res.json({ error : 'User ' + req.params.username + ' not found' });
    } else {
      res.render('graphs', { user : user });
    }
  });
});

app.get('/', function(req, res) {
  res.render('index', { title : 'Home' });
});

//get this deleted after i'm done with drag/drop tutorial
app.get('/dragDrop', function(req, res) {
  res.render('dragDrop', { title : 'Learn' });
});

app.get('/place', function(req, res) {
  res.render('place', {title: 'Title'});
});

app.get('/team', function(req, res) {
  res.render('team', {title: 'Team'});
});

app.get('/mtgox.json', function(req, res) {
  res.json(mtGox);
});

app.post('/subscribe', function(req, res) {
  mailchimp.listSubscribe({ id : mailchimp.listId, email_address : req.body.email }, function(error, data) {
    res.json({ success : true });
  });
});

app.get('/graphs', function(req, res) {
  res.render('graphs', { title : 'Title' });
});

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

app.get('/orders.json', function(req, res) {
  Order.find({}).sort({ 'price' : 1, 'date' : -1 }).exec(function(error, orders) {
    if (error || !orders) {
      res.json({ error : error });
    } else {
      res.json({ orders : orders });
    }
  });
});

app.get('/trades.json', function(req, res) {
  Trade.find({}).sort({ 'date' : -1 }).exec(function(error, trades) {
    if (error || !trades) {
      res.json({ error : error });
    } else {
      res.json({ trades : trades });
    }
  });
});

app.get('/oauth/coinbase/auth', function(req, res) {
  res.redirect(coinbase2.getAuthUrl('http://localhost:3000/oauth/coinbase/callback'));
});
app.get('/oauth/coinbase/callback', function(req, res) {
  coinbase2.handleCallback(req.query.code, function(error, accessToken, refreshToken) {
    res.cookie('coinbaseAccessToken', accessToken);
    res.cookie('coinbaseRefreshToken', refreshToken);
    res.redirect('/');
  });
});

var executeTrade = function(trade, callback) {
  console.log("Requesting! " + trade.sell.email);
  coinbase.requestBitcoins(trade.sell.email, trade.quantity, function(error, result) {
    if (error || !result) {
      callback(error, null);
    } else {
      coinbase.sendBitcoins(trade.buy.email, trade.quantity, function(error, result) {
        callback(error, result);
      });
    }
  });
};

app.post('/order', function(req, res) {
  var o = new Order(req.body);
  User.findOne({ _id : req.body.user }, function(error, user) {
    if (error || !user) {
      console.log("user not found");
      return;
    }

    o.validate(function(error) {
      if (error) {
        res.json({ error : error });
      } else {
        if (req.body.side == "Buy") {
          Order.
              find({ expiry : req.body.expiry, price : { $lte : req.body.price }, quantity : { $gte : req.body.quantity }, side : "Sell" }).
              sort({ 'price' : 1, 'created' : -1 }).
              populate('user').
              exec(function(error, orders) {
                if (orders.length > 0) {
                  var t = { buy : user, sell : orders[0].user, price : orders[0].price, quantity : o.quantity, expiry : o.expiry };
                  var trade = new Trade(t);
                  var insertedTrade = false;
                  var savedOrder = false;

                  executeTrade(t, function(error, result) {
                    trade.save(function(error, trade) {
                      if (savedOrder) {
                        res.json({ matched : true, trade : trade });
                      } else {
                        insertedTrade = true;
                      }
                    });
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
              sort({ 'price' : -1, 'created' : -1 }).
              populate('user').
              exec(function(error, orders) {
                if (orders.length > 0) {
                  console.log(JSON.stringify(o));
                  console.log(JSON.stringify(orders[0]));
                  var t = { sell : user, buy : orders[0].user, price : orders[0].price, quantity : o.quantity, expiry : o.expiry };
                  var trade = new Trade(t);
                  var insertedTrade = false;
                  var savedOrder = false;

                  executeTrade(t, function(error, result) {
                    trade.save(function(error, trade) {
                      if (savedOrder) {
                        res.json({ matched : true, trade : trade });
                      } else {
                        insertedTrade = true;
                      }
                    });
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
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
