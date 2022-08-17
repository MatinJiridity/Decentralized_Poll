var express = require('express');
var app = express();
app.use(express.static('design'));
app.use(express.static('../abis'));
app.get('/', function (req, res) {
  res.render('index.html');
});
app.listen(3000, function () {
  console.log('Your Dapp listening on port 3000!');
});