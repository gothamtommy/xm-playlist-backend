const debug = require('debug')('xmplaylist:sirius');
const moment = require('moment');
const rp = require('request-promise-native');

const stream = require('./stream');
const tracks = require('./tracks');
const spotify = require('./spotify');

// http://www.siriusxm.com/metadata/pdt/en-us/json/channels/thebeat/timestamp/02-25-08:10:00
const baseurl = 'http://www.siriusxm.com';

function parseArtists(artists) {
  return artists.match(/(?:\/\\|[^/\\])+/g);
}

function parseChannelMetadataResponse(obj) {
  const meta = obj.channelMetadataResponse.metaData;
  const currentEvent = meta.currentEvent;
  const song = currentEvent.song;
  // some artists have a /\ symbol
  const artists = parseArtists(currentEvent.artists.name);
  return {
    channelId: meta.channelId,
    channelName: meta.channelName,
    channelNumber: meta.channelNumber,
    name: song.name,
    artists,
    artistsId: currentEvent.artists.id,
    startTime: new Date(currentEvent.startTime),
    songId: song.id,
  };
}

async function checkEndpoint(channel) {
  const dateString = moment.utc().format('MM-DD-HH:mm:00');
  const opt = {
    uri: `${baseurl}/metadata/pdt/en-us/json/channels/${channel.id}/timestamp/${dateString}`,
    json: true,
  };
  debug(opt.uri);
  let res;
  let lastSong;
  try {
    [res, lastSong] = await Promise.all([rp(opt), stream.getLast(channel)]);
  } catch (e) {
    return Promise.resolve(false);
  }
  if (!lastSong) {
    lastSong = {};
  }
  if (!res.channelMetadataResponse || !res.channelMetadataResponse.status) {
    return Promise.resolve(false);
  }
  const newSong = parseChannelMetadataResponse(res);
  if (['^I', ''].includes(newSong.songId) || newSong.name[0] === '#') {
    return Promise.resolve(false);
  }
  if (lastSong.songId === newSong.songId) {
    return Promise.resolve(false);
  }
  // TODO: announce
  debug(newSong);
  try {
    spotify.findAndCache(newSong.songId);
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
exports.parseChannelMetadataResponse = parseChannelMetadataResponse;
