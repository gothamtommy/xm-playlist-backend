const debug = require('debug')('xmplaylist:sirius');
const moment = require('moment');
const got = require('got');

const stream = require('./stream');
const tracks = require('./tracks');
const spotify = require('./spotify');

// http://www.siriusxm.com/metadata/pdt/en-us/json/channels/thebeat/timestamp/02-25-08:10:00
const baseurl = 'http://www.siriusxm.com';

function parseArtists(artists) {
  // splits artists into an array
  return artists.match(/(?:\/\\|[^/\\])+/g);
}
function parseName(name) {
  return name.split(' #')[0];
}

function parseChannelMetadataResponse(obj) {
  const meta = obj.channelMetadataResponse.metaData;
  const currentEvent = meta.currentEvent;
  const song = currentEvent.song;
  // some artists have a /\ symbol
  const artists = parseArtists(currentEvent.artists.name);
  const name = parseName(song.name);
  return {
    channelId: meta.channelId,
    channelName: meta.channelName,
    channelNumber: meta.channelNumber,
    name,
    artists,
    artistsId: currentEvent.artists.id,
    startTime: new Date(currentEvent.startTime),
    songId: song.id,
  };
}

async function checkEndpoint(channel) {
  const dateString = moment.utc().format('MM-DD-HH:mm:00');
  const url = `${baseurl}/metadata/pdt/en-us/json/channels/${channel.id}/timestamp/${dateString}`;
  debug(url);
  const req = got(url, { json: true })
    .then(r => r.body);
  const last = stream.getLast(channel)
    .then(d => d || {})
    .catch(() => { return {}; });
  let lastSong;
  let res;
  try {
    [res, lastSong] = await Promise.all([req, last]);
  } catch (e) {
    return false;
  }
  if (!lastSong) {
    lastSong = {};
  }
  if (!res.channelMetadataResponse || !res.channelMetadataResponse.status) {
    return false;
  }
  const newSong = parseChannelMetadataResponse(res);
  if (['^I', ''].includes(newSong.songId) || newSong.name[0] === '#') {
    return false;
  }
  if (lastSong.songId === newSong.songId) {
    return false;
  }
  // TODO: announce
  debug(newSong);
  try {
    if (process.env.NODE_ENV !== 'test') {
      spotify.findAndCache(newSong.songId);
    }
  } catch (e) {
    debug(`${newSong.songId} not found on spotify`);
  }
  await Promise.all([
    stream.insert(newSong),
    tracks.update(newSong),
  ]);
  return Promise.resolve(true);
}

exports.checkEndpoint = checkEndpoint;
exports.parseArtists = parseArtists;
exports.parseName = parseName;
exports.parseChannelMetadataResponse = parseChannelMetadataResponse;
