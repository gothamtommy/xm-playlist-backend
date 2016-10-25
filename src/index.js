const debug = require('debug')('xmplaylist:index');
const Koa = require('koa');
const logger = require('koa-logger');
const route = require('koa-route');
const cors = require('kcors');

const config = require('../config');


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
// app.use(route.get('/recentBPM', ep.recentBPM));
// app.use(route.get('/new', ep.newsongs));
// app.use(route.get('/mostHeard', ep.mostHeard));
// app.use(route.get('/artists', ep.allArtists));
// app.use(route.get('/artist/:artist', ep.artists));
// app.use(route.get('/song/:song', ep.songFromID));
// app.use(route.get('/songstream/:song', ep.songstream));


if (!module.parent) {
  app.listen(config.port);
  debug('listening on port:', config.port);
}
