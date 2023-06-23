const { parser } = require('html-metadata-parser');
const Koa = require('koa');
const Router = require('@koa/router');
const { get } = require('koa/lib/response');

const app = new Koa();
const router = new Router();

router.get('/', async (ctx, next) => {
  ctx.body = '這裡是 Google Maps 連結預覽好幫手';
});

router.get('/maps/:id', async (ctx, next) => {
  const url = `https://goo.gl/maps/${ctx.params.id}`;
  // console.log(ctx.params.id);
  const metadata = await parser(url).then(result=>{
    // console.log(JSON.stringify(result, null, 3));   
    return result;
  })
  // ctx.body = resp.og.title;
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