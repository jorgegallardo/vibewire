var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var url = 'mongodb://localhost:27017/vibewire';
var morgan = require('morgan');

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));

MongoClient.connect(url, function(err, db) {
  //ensure that we've connected
  assert.equal(null, err);
  console.log("Successfully connected to database server.");
  db.close();
});
// ===== REGISTER NEW USER =====
app.post('/register', function(req, res, next) {
  var newUser = req.body;
  MongoClient.connect(url, function(err, db) {
    db.collection('vibewire').insertOne(newUser, function(err, result) {
      console.log('New user registered.');
      db.close();
    });
  });
  return res.send();
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  var status = 500;
  if(err.status) status = err.status;
  var message = err.toString();
  if(err.message) message = err.message;
  res.status(400);
  return res.send(message);
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});