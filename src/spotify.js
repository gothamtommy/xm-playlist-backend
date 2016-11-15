const got = require('got');
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
  const a = stream.artists.join('+');
  let t = stream.name.replace(/[ ](mix)/i, '');
  const url = `https://api.spotify.com/v1/search?q=artist:${a}+track:${t}+&limit=1&type=track`;
  const res = await got(url, { json: true }).then(r => r.body);
  if (res.tracks.items.length > 0) {
    return parseSpotify(_.first(res.tracks.items));
  }
  t = t.split('-')[0];
  const url2 = `https://api.spotify.com/v1/search?q=track:${t}+&limit=1&type=track`;
  const res2 = await got(url2, { json: true }).then(r => r.body);
  if (res2.tracks.items.length > 0) {
    return parseSpotify(_.first(res2.tracks.items));
  }
  return Promise.reject();
}

async function get(songId) {
  const db = await mongo;
  return db.collection('spotify')
    .findOne({ songId })
    .catch(() => {
      return Promise.resolve(false);
    });
}

async function findAndCache(songId) {
  const doc = await get(songId);
  if (doc) {
    return doc;
  }
  const track = await tracks.getTrack(songId);
  let search;
  try {
    search = await searchTrack(track);
  } catch (e) {
    return Promise.reject(e);
  }
  search.songId = songId;
  const db = await mongo;
  db.collection('spotify').insertOne(search).catch();
  return search;
}


exports.parseSpotify = parseSpotify;
exports.searchTrack = searchTrack;
exports.get = get;
exports.findAndCache = findAndCache;
