const debug = require('debug')('xmplaylist:index');
const Koa = require('koa');
const logger = require('koa-logger');
const router = require('koa-router')();
const cors = require('kcors');
const _ = require('lodash');

const config = require('../config');
const channels = require('./channels');
const stream = require('./stream');
const tracks = require('./tracks');


const app = module.exports = new Koa();
app.proxy = true;

app.use(cors());
if (process.env.NODE_ENV === 'dev') {
  app.use(logger());
}
app.use((ctx, next) => {
  ctx.type = 'json';
  return next();
});

// routes
router.get('/recent/:channelName', async (ctx, next) => {
  const channel = _.find(channels, { name: ctx.params.channelName });
  ctx.assert(channel, 400, 'Channel does not exist');
  ctx.body = await stream.getRecent(channel);
  return next();
});
router.get('/mostHeard/:channelName', async (ctx, next) => {
  const channel = _.find(channels, { name: ctx.params.channelName });
  ctx.assert(channel, 400, 'Channel does not exist');
  ctx.body = await stream.mostHeard(channel);
  return next();
});

router.get('/artists', async (ctx, next) => {
  ctx.body = await tracks.artists();
  return next();
});

router.get('/channels', (ctx, next) => {
  ctx.body = channels;
  return next();
});
// app.use(route.get('/new', ep.newsongs));
// app.use(route.get('/artists', ep.allArtists));
// app.use(route.get('/artist/:artist', ep.artists));
// app.use(route.get('/song/:song', ep.songFromID));
// app.use(route.get('/songstream/:song', ep.songstream));

app
  .use(router.routes())
  .use(router.allowedMethods());

if (!module.parent) {
  app.listen(config.port);
  debug('listening on port:', config.port);
}
