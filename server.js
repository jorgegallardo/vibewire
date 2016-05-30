
var JWT_TOKEN_SECRET = process.env.JWT_SECRET || 'n89e4fjs9asfajse98sfcas';
var STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_JecGrIplyfx1fAZEpgilkdqQ';
var STRIPE_PUBLISH_KEY = process.env.STRIPE_PUBLISH_KEY || 'pk_test_z31N5V87rLS4iTahB0qBhGtx';


var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var url = 'mongodb://localhost:27017/vibewire';
var morgan = require('morgan');
var stripe = require('stripe')(STRIPE_SECRET_KEY);

app.use(morgan('dev'));
app.use(bodyParser.json());

var db;

app.use(responseError);
app.use(responseErrorObject);
app.use(allowCrossOrigin);

/**
 * Handles client and database errors
 */
function responseError(req, res, next) {
  res.sendError = function(status, code, message) {
    var ip = getIpAddress(req);
    if(blacklist[ip]) {
      blacklist[ip]++;
    } else {
      blacklist[ip] = 1;
    }
    if(status) res.status(status);
    else res.status(400);
    return res.json({
      'error': {
        'code': code ? code : 3000,
        'message': message ? message : 'Server Error'
      }
    });
  };
  return next();
}

function responseErrorObject(req, res, next) {
  res.sendErrorObject = function(err) {
    console.log(err)
    return res.sendError(err.status, err.code, err.message)
  };
  return next();
}

function allowCrossOrigin(req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,authorization,platform,platform-version,app-version,app-bundle');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  return next();
}

// var StripeCustomer = require('./server/model/stripe.js').StripeCustomer;
// var StripeCharge = require('./server/model/stripe.js').StripeCharge;
// var StripeRefund = require('./server/model/stripe.js').StripeRefund;
// var StripeRecipient = require('./server/model/stripe.js').StripeRecipient;
// var StripeTransfer = require('./server/model/stripe.js').StripeTransfer;

// ===== REGISTER NEW USER =====
app.post('/register', function(req, res, next) {
  var newUser = req.body;
  //MongoClient.connect(url, function(err, db) {
    db.collection('users').insertOne(newUser, function(err, result) {
      console.log('New user registered.');
      //db.close();
    });
  //});
  return res.send();
});

app.post('/putCardOnFile', function(req, res, next) {
  var stripeCustomer = {
    card: req.body.cardToken,
    email: req.body.email,
    description: req.body.description
  };
  return Stripe.customers.create(stripeCustomer).then(function(customer) {
    customer.stripeId = customer.id.toString();
    db.collection('stripeCustomers').insertOne(customer, function(err, result) {
      if (err) return res.sendErrorObject(err);
      console.log('New card added.');
      return res.send();
    });
  }, function(err) {
    console.log(err);
    return res.sendErrorObject(err);
  });
});

app.use(express.static(__dirname + '/public'));

// redirect for front end routes
app.get('*', function(req, res) {
  return res.redirect('/#!' + req.originalUrl);
});


app.use(function(err, req, res, next) {
  console.error(err.stack);
  var status = 500;
  if(err.status) status = err.status;
  var message = err.toString();
  if(err.message) message = err.message;
  res.status(status);
  return res.send(message);
});

MongoClient.connect(url, function(err, dbconn) {
  //ensure that we've connected
  assert.equal(null, err);
  db = dbconn;
  console.log("Successfully connected to database server.");

  app.listen(3000, function () {
    console.log('App listening on port 3000!');
  });
});

