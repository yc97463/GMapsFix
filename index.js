const Koa = require('koa');
const Router = require('@koa/router');
const serve = require('koa-static');
const path = require('path');
const https = require('https');

const app = new Koa();
const router = new Router();

app.use(serve(path.join(__dirname, 'public')));

function extractMetadata(html, url) {
  const metadata = { og: {} };
  
  // Extract title
  const titleMatch = html.match(/<meta\s+content="([^"]+)"\s+property="og:title">/i);
  if (titleMatch) {
    metadata.og.title = titleMatch[1].trim();
  }

  // Extract description
  const descriptionMatch = html.match(/<meta\s+content="([^"]+)"\s+property="og:description">/i);
  if (descriptionMatch) {
    metadata.og.description = descriptionMatch[1].trim();
  }

  // Extract image
  const imageMatch = html.match(/<meta\s+content="([^"]+)"\s+property="og:image">/i);
  if (imageMatch) {
    // metadata.og.image = imageMatch[1].trim();
    // parase to `&amp`
    metadata.og.image = imageMatch[1].replace(/&amp;/g, '&');
  }

  // Extract image dimensions
  const imageWidthMatch = html.match(/<meta\s+content="(\d+)"\s+property="og:image:width">/i);
  const imageHeightMatch = html.match(/<meta\s+content="(\d+)"\s+property="og:image:height">/i);
  if (imageWidthMatch && imageHeightMatch) {
    metadata.og.imageWidth = imageWidthMatch[1];
    metadata.og.imageHeight = imageHeightMatch[1];
  }

  // Extract coordinates from URL
  const coordsMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (coordsMatch) {
    metadata.coords = {
      lat: coordsMatch[1],
      lng: coordsMatch[2]
    };
  }

  console.log('Extracted metadata:', metadata);
  return metadata;
}

async function fetchMetadata(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        // Follow redirect
        return fetchMetadata(res.headers.location).then(resolve).catch(reject);
      }

      let html = '';
      res.on('data', (chunk) => {
        html += chunk;
        if (html.includes('</head>')) {
          res.destroy(); // Stop the stream once we've got the head
          resolve(extractMetadata(html, url));
        }
      });
      res.on('end', () => {
        resolve(extractMetadata(html, url));
      });
    }).on('error', reject);
  });
}

async function generateHtmlWithMetadata(url) {
  const metadata = await fetchMetadata(url);
  
  let title = metadata.og.title || 'Google Maps Location';
  title += ' &#128588; Google Maps 分享連結預覽好幫手';
  
  let description = metadata.og.description || "View this location on Google Maps";
  if (metadata.coords) {
    description += ` (${metadata.coords.lat}, ${metadata.coords.lng})`;
  }
  
  let img = metadata.og.image || "https://maps.gstatic.com/mapfiles/maps_lite/images/2x/ic_map_center_marker.png";

  let html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>${title}</title>
    <meta name="title" content="${title}" />
    <meta name="description" content="${description}" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${url}" />
    <meta property="og:site_name" content="${title}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${img}" />
    ${metadata.og.imageWidth ? `<meta property="og:image:width" content="${metadata.og.imageWidth}" />` : ''}
    ${metadata.og.imageHeight ? `<meta property="og:image:height" content="${metadata.og.imageHeight}" />` : ''}

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${url}" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${img}" />

    <!-- Telegram -->
    <meta property="og:image" content="${img}" />
    <meta property="telegram_channel" content="turbolabit">

    <!-- Redirect to Google Maps -->
    <meta http-equiv="refresh" content="2; url = ${url}" />

    <style>
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC&display=swap');
      * {
        font-family: "Heiti TC", "Noto Sans TC", sans-serif;
      }
      .message {
        margin: 20px 10px;
      }
      .message a {
        background: #0D5C33;
        padding: 4px 10px;
        color: #FFF;
        border-radius: 15px;
        text-decoration: none;
      }
      .message a:hover, .message a:active {
        color: #FFF;
        text-decoration: none;
      }
      .message a::before {
        content: "🔗 ";
      }
    </style>
    
  </head>
  <body>
    <div class="message">
      Google Maps 分享連結預覽好幫手 🙌 正在帶您前往 <a href="${url}">${url}</a>。
    </div>
  </body>
  </html>
  `;
  return html;
}

// Keep your existing routes
router.get('/', async (ctx, next) => {
  let title = "Google Maps 分享連結預覽好幫手 🙌";
  let description = "分享 Google Maps 連結有預覽資訊的神奇魔法！✨";
  let img = `https://maps.dstw.dev/og.jpg`
  let url = `https://maps.dstw.dev/`
  let html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>${title}</title>
    <meta name="title" content="${title}" />
    <meta name="description" content="${description}" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${url}" />
    <meta property="og:site_name" content="${title}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${img}" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${url}" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${img}" />

    <!-- Telegram -->
    <meta property="og:image" content="${img}" />
    <meta property="telegram_channel" content="turbolabit">
    
    <!-- Redirect to README -->
    <meta http-equiv="refresh" content="0; url = https://github.com/yc97463/GMapsFix/blob/main/README.md" />
  </head>
  <body></body>
  </html>
  `
  ctx.body = html;
  ctx.type = 'text/html';
});

router.get('/maps/:id', async (ctx, next) => {
  const url = `https://goo.gl/maps/${ctx.params.id}?_imcp=1`;
  ctx.body = await generateHtmlWithMetadata(url);
  ctx.type = 'text/html';
});

router.get('/:id', async (ctx, next) => {
  const url = `https://maps.app.goo.gl/${ctx.params.id}?_imcp=1`;
  ctx.body = await generateHtmlWithMetadata(url);
  ctx.type = 'text/html';
});

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3000, () => {
  console.log('Server running on port 3000');
});