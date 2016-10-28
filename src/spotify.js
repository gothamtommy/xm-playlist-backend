const rp = require('request-promise-native');
const _ = require('lodash');

const mongo = require('./mongo');
const tracks = require('./tracks');

function parseSpotify(obj) {
  const cover = _.first(obj.album.images) || {};
  return {
    cover: cover.url,
    spotifyId: obj.id,
    name: obj.name,
    duration_ms: obj.duration_ms,
    url: obj.external_urls.spotify,
  };
}

async function searchTrack(stream) {
  const a = `artist:${stream.artists.join('+')}`;
  const t = `track:${stream.name}`;
  const options = {
    uri: `https://api.spotify.com/v1/search?q=${a}+${t}+&limit=1&type=track`,
    json: true,
  };
  const res = await rp(options);
  if (res.tracks.items.length > 0) {
    return parseSpotify(_.first(res.tracks.items));
  }
  return Promise.reject();
}

async function findAndCache(ctx, next) {
  const songId = ctx.params.songId;
  const db = await mongo;
  ctx.body = await db.collection('spotify').findOne({ songId }).catch();
  if (ctx.body) {
    return next();
  }
  const track = await tracks.getTrack(songId);
  ctx.assert(track, 400, 'Track not found');
  const search = await searchTrack(track);
  search.songId = songId;
  db.collection('spotify').insertOne(search);
  ctx.body = search;
  return next();
}


exports.parseSpotify = parseSpotify;
exports.searchTrack = searchTrack;
exports.findAndCache = findAndCache;
