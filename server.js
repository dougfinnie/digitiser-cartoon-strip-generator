// server.js
// where your node app starts

// init project
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const app = express();
// var assets = require('./assets');

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for the output endpoint
const outputLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 comic generations per minute
  message: 'Too many comic generations, please wait a minute before creating more.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all requests
app.use(limiter);

// Request size limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ['\'self\''],
      styleSrc: ['\'self\'', '\'unsafe-inline\''],
      imgSrc: ['\'self\'', 'data:', 'https:'],
      scriptSrc: ['\'self\'']
    }
  }
}));

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// Serve local assets folder
app.use('/assets', express.static('assets'));

// Helper function to safely serve files with timeout
function serveFile(filePath) {
  return function(request, response) {
    // Set response timeout
    const timeout = setTimeout(() => {
      if (!response.headersSent) {
        response.status(408).send('Request timeout');
      }
    }, 30000); // 30 second timeout

    const safePath = path.join(__dirname, 'views', path.basename(filePath));
    
    response.sendFile(safePath, (err) => {
      clearTimeout(timeout);
      if (err && !response.headersSent) {
        console.error('Error serving file:', err);
        response.status(404).send('File not found');
      }
    });
  };
}

// Helper function to sanitize HTML content
function escapeHtml(unsafe) {
  if (typeof unsafe !== 'string') {
    return '';
  }
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\//g, '&#x2F;')  // Forward slash
    .replace(/`/g, '&#x60;')   // Backtick
    .replace(/=/g, '&#x3D;');  // Equals sign
}

// Additional XSS protection for template content
function sanitizeTemplateContent(content) {
  // Remove any remaining script tags, even if they're encoded
  content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  content = content.replace(/javascript:/gi, '');
  content = content.replace(/on\w+\s*=/gi, ''); // Remove event handlers
  content = content.replace(/data:text\/html/gi, ''); // Remove data URLs
  content = content.replace(/vbscript:/gi, '');
  return content;
}

// Helper function to validate image filename
function isValidImageName(filename) {
  if (!filename || typeof filename !== 'string') return false;
  // Only allow alphanumeric characters, hyphens, underscores, and dots
  const validPattern = /^[a-zA-Z0-9._%-]+\.gif$/;
  return validPattern.test(filename) && !filename.includes('..');
}

// Helper function to create safe image tags
function createImageTag(imageName) {
  if (!imageName || !isValidImageName(imageName)) {
    return '';
  }
  const safeName = escapeHtml(imageName);
  return `<img src="/assets/${safeName}" alt="Character" />`;
}

// Helper function to sanitize text input
function sanitizeTextInput(input) {
  if (!input) return '';
  // Convert to string, limit length, remove potentially dangerous characters
  let text = String(input).substring(0, 200);
  // Remove any null bytes or control characters
  // eslint-disable-next-line no-control-regex
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  return escapeHtml(text);
}

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', serveFile('default.html'));
app.get('/default.html', serveFile('default.html'));
app.get('/characters.asp', serveFile('characters.html'));
app.get('/input.asp', serveFile('input.html'));
app.get('/faq.html', serveFile('faq.html'));
app.get('/links.html', serveFile('links.html'));
app.get('/output.asp', outputLimiter, function (request, response) {
  try {
    // const images = require('./images');
    const fs = require('fs');
    const templatePath = path.join(__dirname, 'views', 'output.html');
    let content = fs.readFileSync(templatePath, 'utf8');

    // Sanitize and validate text inputs with strict validation

    const texta = sanitizeTextInput(request.query.texta);
    const textb = sanitizeTextInput(request.query.textb);
    const textc = sanitizeTextInput(request.query.textc);
    const textd = sanitizeTextInput(request.query.textd);
    const texte = sanitizeTextInput(request.query.texte);
    const textf = sanitizeTextInput(request.query.textf);
    const textg = sanitizeTextInput(request.query.textg);
    const texth = sanitizeTextInput(request.query.texth);

    // Create safe image tags using helper function

    const boxa = createImageTag(request.query.boxa);
    const boxb = createImageTag(request.query.boxb);
    const boxc = createImageTag(request.query.boxc);
    const boxd = createImageTag(request.query.boxd);
    const boxe = createImageTag(request.query.boxe);
    const boxf = createImageTag(request.query.boxf);
    const boxg = createImageTag(request.query.boxg);
    const boxh = createImageTag(request.query.boxh);

    // Replace placeholders with sanitized content
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

    // Final XSS protection scan on the complete content
    content = sanitizeTemplateContent(content);

    // Set security headers and return response
    response.set({
      'Content-Type': 'text/html; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    });
    response.send(content);
  } catch (error) {
    console.error('Error processing request:', error);
    response.status(500).send('Internal Server Error');
  }
});
// listen for requests :)
const listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
