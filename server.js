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
app.get("/output.asp", function (request, response) {
  var fs = require('fs');
  var content = fs.readFileSync('./views/output.html', 'utf8');

  // read variables
  let texta = request.query.texta ? request.query.texta : '';
  let textb = request.query.textb ? request.query.textb : '';
  let textc = request.query.textc ? request.query.textc : '';
  let textd = request.query.textd ? request.query.textd : '';
  let texte = request.query.texte ? request.query.texte : '';
  let textf = request.query.textf ? request.query.textf : '';
  let textg = request.query.textg ? request.query.textg : '';
  let texth = request.query.texth ? request.query.texth : '';
  
  let boxa = request.query.boxa ? `<img src="/assets/${request.query.boxa}" />` : '';
  let boxb = request.query.boxb ? `<img src="/assets/${request.query.boxb}" />` : '';;
  let boxc = request.query.boxc ? `<img src="/assets/${request.query.boxc}" />` : '';;
  let boxd = request.query.boxd ? `<img src="/assets/${request.query.boxd}" />` : '';;
  let boxe = request.query.boxe ? `<img src="/assets/${request.query.boxe}" />` : '';;
  let boxf = request.query.boxf ? `<img src="/assets/${request.query.boxf}" />` : '';;
  let boxg = request.query.boxg ? `<img src="/assets/${request.query.boxg}" />` : '';;
  let boxh = request.query.boxh ? `<img src="/assets/${request.query.boxh}" />` : '';;

  // replace string
  content = content.replace("${texta}", texta);
  content = content.replace("${textb}", textb);
  content = content.replace("${textc}", textc);
  content = content.replace("${textd}", textd);
  content = content.replace("${texte}", texte);
  content = content.replace("${textf}", textf);
  content = content.replace("${textg}", textg);
  content = content.replace("${texth}", texth);
  
  content = content.replace("${boxa}", boxa);
  content = content.replace("${boxb}", boxb);
  content = content.replace("${boxc}", boxc);
  content = content.replace("${boxd}", boxd);
  content = content.replace("${boxe}", boxe);
  content = content.replace("${boxf}", boxf);
  content = content.replace("${boxg}", boxg);
  content = content.replace("${boxh}", boxh);

  // return raw html
  response.set('Content-Type', 'text/html');
  response.send(Buffer.from(content));
});
// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
