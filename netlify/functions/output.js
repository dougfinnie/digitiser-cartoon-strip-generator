// Template embedded directly in function for Netlify deployment
const TEMPLATE = `<html>
  <head>
    <title>A Cartoon</title>
  </head>
  <body bgcolor="black" link="ff00ff" vlink="ff00ff">
    <font color="00ff00" face="courier"
      ><center>
        <h1>Digitiser Cartoon Strip Generator</h1>
        <table>
          <tr>
            <td width="60" align="center">
              <font face="courier"><a href="default.html">Home</a></font>
            </td>
            <td width="60" align="center">
              <font face="courier"><a href="input.html">Create</a></font>
            </td>
            <td width="60" align="center">
              <font face="courier"><a href="faq.html">FAQ</a></font>
            </td>
            <td width="60" align="center">
              <font face="courier"
                ><a href="characters.asp">Characters</a></font
              >
            </td>
            <td width="60" align="center">
              <font face="courier"><a href="links.html">Links</a></font>
            </td>
          </tr>
        </table>
        <br /><br /><br />

        <table width="70%" align="center" rules="ROWS" border="1">
          <tr>
            <td valign="bottom">
              <center>
                <font color="00ffff" face="courier">\${texta}<br /> </font>
              </center>
              <br />
              <center>\${boxa}</center>
            </td>
            <td valign="bottom">
              <center>
                <font color="yellow" face="courier">\${textb}<br /> </font>
              </center>
              <br />
              <center>\${boxb}</center>
            </td>
          </tr>
          <tr>
            <td valign="bottom">
              <center>
                <font color="00ffff" face="courier">\${textc}<br /> </font>
              </center>
              <br />
              <center>\${boxc}</center>
            </td>
            <td valign="bottom">
              <center>
                <font color="yellow" face="courier">\${textd}<br /> </font>
              </center>
              <br />
              <center>\${boxd}</center>
            </td>
          </tr>
          <tr>
            <td valign="bottom">
              <center>
                <font color="00ffff" face="courier">\${texte}<br /> </font>
              </center>
              <br />
              <center>\${boxe}</center>
            </td>
            <td valign="bottom">
              <center>
                <font color="yellow" face="courier">\${textf}<br /> </font>
              </center>
              <br />
              <center>\${boxf}</center>
            </td>
          </tr>
          <tr>
            <td valign="bottom">
              <center>
                <font color="00ffff" face="courier">\${textg}<br /> </font>
              </center>
              <br />
              <center>\${boxg}</center>
            </td>
            <td valign="bottom">
              <center>
                <font color="yellow" face="courier">\${texth}<br /> </font>
              </center>
              <br />
              <center>\${boxh}</center>
            </td>
          </tr>
        </table>

        <font face="courier" color="yellow">
          <br /><br />To link to this cartoon copy and paste the address below:
          <br /><br />

          <a
            href="{{OUTPUT_URL}}"
            >{{OUTPUT_URL}}</a
          >
        </font>
      </center>
    </font>
  </body>
</html>`;

// Helper function to get template
function getTemplate() {
  return TEMPLATE;
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
  const maxRequests = 30;
  
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

    // Generate current URL with query parameters
    const queryString = new URLSearchParams(params).toString();
    // Get host from headers (Netlify provides host in different headers)
    const host = event.headers.host || event.headers['x-forwarded-host'] || '';
    const protocol = event.headers['x-forwarded-proto'] || 'https';
    const currentUrl = host ? `${protocol}://${host}/output.asp${queryString ? '?' + queryString : ''}` : `/output.asp${queryString ? '?' + queryString : ''}`;

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

    // Replace the hardcoded URL with the current dynamic URL (replace all occurrences)
    content = content.replace(/\{\{OUTPUT_URL\}\}/g, currentUrl);

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