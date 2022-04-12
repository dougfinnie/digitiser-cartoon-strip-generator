// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var assets = require('./assets');

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

app.use("/assets", assets);

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/default.html');
});
app.get("/default.html", function (request, response) {
  response.sendFile(__dirname + '/views/default.html');
});
app.get("/characters.asp", function (request, response) {
  response.sendFile(__dirname + '/views/characters.html');  
});
app.get("/input.asp", function (request, response) {
  response.sendFile(__dirname + '/views/input.html');  
});
app.get("/faq.html", function (request, response) {
  response.sendFile(__dirname + '/views/faq.html');  
});
app.get("/links.html", function (request, response) {
  response.sendFile(__dirname + '/views/links.html');  
});
app.get("/output.html", function (request, response) {
  response.sendFile(__dirname + '/views/output.html');  
});
// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
