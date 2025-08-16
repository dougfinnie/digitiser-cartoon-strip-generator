const fs = require('fs');
const path = require('path');

// Helper function to safely serve files with timeout
function getTemplate() {
  const templatePath = path.join(process.cwd(), 'views', 'output.html');
  return fs.readFileSync(templatePath, 'utf8');
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

// Simple rate limiting using in-memory store (for demo purposes)
const rateLimitStore = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 10;
  
  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  const record = rateLimitStore.get(ip);
  if (now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
}

exports.handler = async (event, context) => {
  try {
    // Get client IP for rate limiting
    const clientIP = event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown';
    
    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      return {
        statusCode: 429,
        headers: {
          'Content-Type': 'text/plain',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin'
        },
        body: 'Too many comic generations, please wait a minute before creating more.'
      };
    }

    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
      return {
        statusCode: 405,
        headers: {
          'Content-Type': 'text/plain'
        },
        body: 'Method Not Allowed'
      };
    }

    // Get query parameters
    const params = event.queryStringParameters || {};
    
    // Get template content
    let content = getTemplate();

    // Sanitize and validate text inputs with strict validation
    const texta = sanitizeTextInput(params.texta);
    const textb = sanitizeTextInput(params.textb);
    const textc = sanitizeTextInput(params.textc);
    const textd = sanitizeTextInput(params.textd);
    const texte = sanitizeTextInput(params.texte);
    const textf = sanitizeTextInput(params.textf);
    const textg = sanitizeTextInput(params.textg);
    const texth = sanitizeTextInput(params.texth);

    // Create safe image tags using helper function
    const boxa = createImageTag(params.boxa);
    const boxb = createImageTag(params.boxb);
    const boxc = createImageTag(params.boxc);
    const boxd = createImageTag(params.boxd);
    const boxe = createImageTag(params.boxe);
    const boxf = createImageTag(params.boxf);
    const boxg = createImageTag(params.boxg);
    const boxh = createImageTag(params.boxh);

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

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      },
      body: content
    };
  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'text/plain'
      },
      body: 'Internal Server Error'
    };
  }
};