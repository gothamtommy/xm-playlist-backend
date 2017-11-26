import * as debug from 'debug';
import * as Koa from 'koa';
import * as kcors from 'kcors';
import * as logger from 'koa-logger';
import * as koaRaven from 'koa2-raven';
import * as Raven from 'raven';
import * as Router from 'koa-router';
import * as _ from 'lodash';
import { Op, col, fn } from 'sequelize';
import { subDays } from 'date-fns';
import * as puppeteer from 'puppeteer';

import config from '../config';
import { channels } from './channels';
import { getRecent, popular } from './plays';
import { Artist, Play, sequelize, Spotify, Track } from '../models';
import { spotifyFindAndCache, updatePlaylists } from './spotify';
import { playsByDay } from './tracks';

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
router.get('/channel/:id', async (ctx, next) => {
  ctx.assert(ctx.params.id, 400, 'Channel does not exist');
  const channel = channels.find(_.matchesProperty('id', ctx.params.id));
  ctx.assert(channel, 400, 'Channel does not exist');
  if (ctx.query.last) {
    const last = new Date(parseInt(ctx.query.last, 10));
    ctx.body = await getRecent(channel, last);
  } else {
    ctx.body = await getRecent(channel);
  }
  return next();
});

router.get('/newest/:id', async (ctx, next) => {
  ctx.assert(ctx.params.id, 400, 'Channel does not exist');
  const channel = channels.find(_.matchesProperty('id', ctx.params.id));
  ctx.assert(channel, 400, 'Channel does not exist');
  const thirtyDays = subDays(new Date(), 30);
  const ids: number[] = await Play.findAll({
    where: {
      channel: channel.number,
      startTime: { [Op.gt]: thirtyDays },
    },
    attributes: [fn('DISTINCT', col('trackId')), 'trackId'],
  }).then((t) => t.map((n) => n.get('trackId')));
  ctx.body = await Track.findAll({
    where: {
      id: { [Op.in]: ids },
    },
    order: [['createdAt', 'desc']],
    limit: 50,
    include: [Artist, Spotify],
  }).then((t) => t.map((n) => n.toJSON()));
  return next();
});

router.get('/popular/:id', async (ctx, next) => {
  ctx.assert(ctx.params.id, 400, 'Channel does not exist');
  const channel = channels.find(_.matchesProperty('id', ctx.params.id));
  ctx.assert(channel, 400, 'Channel does not exist');
  ctx.body = await popular(channel);
  return next();
});

router.get('/track/:trackId', async (ctx, next) => {
  const trackId = ctx.params.trackId;
  ctx.assert(trackId, 400, 'Song ID required');
  ctx.body = await Track.findById(trackId, {
    include: [Artist, Spotify],
  }).then((t) => t.toJSON());
  const daysago = subDays(new Date(), 30);
  ctx.body.playsByDay = await playsByDay(trackId);
  return next();
});

router.get('/trackActivity/:id', async (ctx, next) => {
  const trackId = ctx.params.id;
  ctx.assert(trackId, 400, 'Song ID required');
  const daysago = subDays(new Date(), 30);
  ctx.body = await playsByDay(trackId);
  return next();
});

router.get('/artist/:id', async (ctx, next) => {
  const artistId = ctx.params.id;
  const channel = channels.find(_.matchesProperty('id', ctx.query.channel));
  ctx.assert(artistId, 400, 'Artist ID required');
  let trackIds = await Track
    .findAll({
      attributes: ['id'],
      include: [{
        model: Artist,
        where: { id: artistId },
        attributes: [],
      }],
    })
    .then((t) => t.map((n) => n.get('id')))
    .catch(() => []);
  if (channel) {
    trackIds = await Play
      .findAll({
        where: {
          trackId: { [Op.in]: trackIds },
          channel: channel.number,
        },
      })
      .then((t) => t.map((n) => n.get('trackId')))
      .catch(() => []);
  }
  ctx.body = {};
  ctx.body.artist = await Artist.findById(artistId);
  ctx.body.tracks = await Track.findAll({
    where: { id: { [Op.in]: trackIds } },
    include: [Artist, Spotify],
  }).catch(() => []);
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
  ctx.assert(trackId, 400, 'ID Required');
  const force = Boolean(ctx.query.force);
  const spotify = await Spotify.findOne({ where: { trackId } });
  if (spotify && force) {
    try {
      await spotify.destroy();
    } catch (e) {
      log(`trackId: Not found`);
    }
  }
  if (spotify && !force) {
    ctx.body = spotify.toJSON();
    return next();
  }
  const track = await Track.findById(trackId, { include: [Artist] }).then((t) =>
    t.toJSON(),
  );
  let doc;
  try {
    doc = await spotifyFindAndCache(track);
  } catch (e) {
    ctx.throw(404, 'Not Found');
  }
  ctx.assert(doc, 404, 'Not Found');
  ctx.body = doc;
  return next();
});

router.get('/updatePlaylist', async (ctx, next) => {
  const code = ctx.query.code;
  if (!code) {
    ctx.redirect(
      `https://accounts.spotify.com/authorize?client_id=${config.spotifyClientId}&response_type=code&redirect_uri=${config.location}/updatePlaylist&scope=playlist-modify-public&state=xmplaylist`,
    );
    return next();
  }
  updatePlaylists(code);
  ctx.body = '"success"';
  return next();
});

router.get('/triggerUpdate', async (ctx, next) => {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  await page.goto(`${config.host}/updatePlaylist`, { waitUntil: 'networkidle2' });
  await page.click('.btn,.btn-sm');
  await page.waitForSelector('#login-username');
  await page.type('input#login-username', config.spotifyUsername);
  await page.type('input#login-password', config.spotifyPassword);
  await page.click('.btn-green');
  await page.waitForNavigation();
  ctx.body = '"success"';
  return next();
});

app.use(router.routes()).use(router.allowedMethods());

if (!module.parent) {
  app.listen(config.port);
  log(`http://localhost:${config.port}`);
}
