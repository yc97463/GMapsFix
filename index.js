const { parser } = require('html-metadata-parser');
const Koa = require('koa');
const Router = require('@koa/router');
const { get } = require('koa/lib/response');
const serve = require('koa-static')
const path = require('path');

const app = new Koa();
const router = new Router();

app.use(serve(path.join(__dirname, 'public')));

router.get('/', async (ctx, next) => {
  let title = "Google Maps 分享連結預覽好幫手🙌";
  let description = "這裡是 Google Maps 分享連結預覽好幫手🙌。 maps.dstw.dev";
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
  const url = `https://goo.gl/maps/${ctx.params.id}`;
  // console.log(ctx.params.id);
  const metadata = await parser(url).then(result=>{
    // console.log(JSON.stringify(result, null, 3));   
    return result;
  })
  ctx.body = `
  <meta content="${metadata.og.title}" property="og:title"> 
  <meta content="${metadata.og.image}" property="og:image">
  <meta content="${metadata.og.description || ""}" property="og:description">
  <meta http-equiv="refresh" content="0; url = ${url}" />
  `;
});

router.get('/:id', async (ctx, next) => {
  const url = `https://maps.app.goo.gl/${ctx.params.id}`;
  const metadata = await parser(url).then(result=>{ 
    return result;
  })
  ctx.body = `
  <meta content="${metadata.og.title}" property="og:title"> 
  <meta content="${metadata.og.image}" property="og:image">
  <meta content="${metadata.og.description || ""}" property="og:description">
  <meta http-equiv="refresh" content="0; url = ${url}" />
  `;
});

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3000, () => {
  console.log('Server running on port 3000  \n');
});