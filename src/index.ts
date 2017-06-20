import * as debug from 'debug';
import * as Koa from 'koa';
import * as kcors from 'kcors';
import * as logger from 'koa-logger';
import * as koaRaven from 'koa2-raven';
import * as Raven from 'raven';
import * as Router from 'koa-router';
import * as _ from 'lodash';

import config from '../config';
import { channels } from './channels';
import { getRecent } from './plays';
import { Track, Artist } from '../models';
import { spotifyFindAndCache } from './spotify';
const tracks = require('./tracks');

const log = debug('xmplaylist');
const app = new Koa();
export default app;
app.proxy = true;
const router = new Router();

app.use(kcors());
if (process.env.NODE_ENV === 'dev') {
  app.use(logger());
}
if (config.dsn) {
  const sentry = Raven
    .config(config.dsn, { autoBreadcrumbs: true })
    .install({ captureUnhandledRejections: true });
  koaRaven(app, sentry);
}
app.use((ctx, next) => {
  ctx.type = 'json';
  return next();
});

// routes
router.get('/recent/:id', async (ctx, next) => {
  ctx.assert(ctx.params.id, 400, 'Channel does not exist');
  const channel = _.find(channels, _.matchesProperty('id', ctx.params.id));
  ctx.assert(channel, 400, 'Channel does not exist');
  if (ctx.query.last) {
    const last = new Date(parseInt(ctx.query.last, 10));
    ctx.body = await getRecent(channel, last);
  } else {
    ctx.body = await getRecent(channel);
  }
  return next();
});
// router.get('/mostHeard/:channelName', async (ctx, next) => {
//   const channel = _.find(channels, { name: ctx.params.channelName });
//   ctx.assert(channel, 400, 'Channel does not exist');
//   ctx.body = await stream.mostHeard(channel);
//   return next();
// });
router.get('/track/:trackId', async (ctx, next) => {
  const trackId = ctx.params.trackId;
  ctx.assert(trackId, 400, 'Song Id required');
  ctx.body = await Track.findById(trackId, { include: [{ model: Artist }] });
  return next();
});

router.get('/artists', async (ctx, next) => {
  ctx.body = await tracks.artists();
  return next();
});

router.get('/channels', (ctx, next) => {
  ctx.body = channels.map((n) => {
    // n.img = `https://www.siriusxm.com/albumart/Live/Default/DefaultMDS_m_${n.number}.jpg`;
    n.img = `http://pri.art.prod.streaming.siriusxm.com/images/channel/20170503/${n.id}-1-31-00-180x180.png`;
    return n;
  });
  return next();
});

router.get('/spotify/:trackId', async (ctx, next) => {
  const trackId = ctx.params.trackId;
  let doc;
  try {
    doc = await spotifyFindAndCache(trackId);
  } catch (e) {
    ctx.throw(404, 'Not Found');
  }
  ctx.assert(doc, 404, 'Not Found');
  ctx.body = doc;
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
  log(`https://localhost:${config.port}`);
}
