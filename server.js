// server.js
// where your node app starts

// init project
const express = require('express');
const app = express();
// var assets = require('./assets');

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// Serve local assets folder
app.use('/assets', express.static('assets'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function (request, response) {
  response.sendFile(__dirname + '/views/default.html');
});
app.get('/default.html', function (request, response) {
  response.sendFile(__dirname + '/views/default.html');
});
app.get('/characters.asp', function (request, response) {
  response.sendFile(__dirname + '/views/characters.html');
});
app.get('/input.asp', function (request, response) {
  response.sendFile(__dirname + '/views/input.html');
});
app.get('/faq.html', function (request, response) {
  response.sendFile(__dirname + '/views/faq.html');
});
app.get('/links.html', function (request, response) {
  response.sendFile(__dirname + '/views/links.html');
});
app.get('/output.asp', function (request, response) {
  // const images = require('./images');
  const fs = require('fs');
  let content = fs.readFileSync('./views/output.html', 'utf8');

  // read variables
  const texta = request.query.texta ? request.query.texta : '';
  const textb = request.query.textb ? request.query.textb : '';
  const textc = request.query.textc ? request.query.textc : '';
  const textd = request.query.textd ? request.query.textd : '';
  const texte = request.query.texte ? request.query.texte : '';
  const textf = request.query.textf ? request.query.textf : '';
  const textg = request.query.textg ? request.query.textg : '';
  const texth = request.query.texth ? request.query.texth : '';

  const boxa = request.query.boxa
    ? `<img src="/assets/${request.query.boxa}" />`
    : '';
  const boxb = request.query.boxb
    ? `<img src="/assets/${request.query.boxb}" />`
    : '';
  const boxc = request.query.boxc
    ? `<img src="/assets/${request.query.boxc}" />`
    : '';
  const boxd = request.query.boxd
    ? `<img src="/assets/${request.query.boxd}" />`
    : '';
  const boxe = request.query.boxe
    ? `<img src="/assets/${request.query.boxe}" />`
    : '';
  const boxf = request.query.boxf
    ? `<img src="/assets/${request.query.boxf}" />`
    : '';
  const boxg = request.query.boxg
    ? `<img src="/assets/${request.query.boxg}" />`
    : '';
  const boxh = request.query.boxh
    ? `<img src="/assets/${request.query.boxh}" />`
    : '';

  // replace string
  content = content.replace('${texta}', texta);
  content = content.replace('${textb}', textb);
  content = content.replace('${textc}', textc);
  content = content.replace('${textd}', textd);
  content = content.replace('${texte}', texte);
  content = content.replace('${textf}', textf);
  content = content.replace('${textg}', textg);
  content = content.replace('${texth}', texth);

  content = content.replace('${boxa}', boxa);
  content = content.replace('${boxb}', boxb);
  content = content.replace('${boxc}', boxc);
  content = content.replace('${boxd}', boxd);
  content = content.replace('${boxe}', boxe);
  content = content.replace('${boxf}', boxf);
  content = content.replace('${boxg}', boxg);
  content = content.replace('${boxh}', boxh);

  // return raw html
  response.set('Content-Type', 'text/html');
  response.send(Buffer.from(content));
});
// listen for requests :)
const listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
