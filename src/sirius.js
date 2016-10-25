const debug = require('debug')('xmplaylist:sirius');
const moment = require('moment');
const rp = require('request-promise-native');
const _ = require('lodash');

const stream = require('./stream');
const tracks = require('./tracks');

// http://www.siriusxm.com/metadata/pdt/en-us/json/channels/thebeat/timestamp/02-25-08:10:00
const baseurl = 'http://www.siriusxm.com';
const badIds = ['^I', ''];

function parseChannelMetadataResponse(obj) {
  const meta = obj.channelMetadataResponse.metaData;
  const currentEvent = meta.currentEvent;
  const song = currentEvent.song;
  // some artists have a /\ symbol
  const artists = currentEvent.artists.name.match(/(?:\/\\|[^/\\])+/g);
  const startTime = new Date(currentEvent.startTime);
  const res = {
    channelId: meta.channelId,
    name: song.name,
    artists,
    artistsId: currentEvent.artists.id,
    startTime,
    songId: song.id,
  };
  // find largest album art
  const albumArts = _.filter(song.creativeArts, (n) => {
    return n.url && n.url.length
      && n.encrypted === false
      && n.type === 'IMAGE'
      && ['LARGE', 'MEDIUM'].includes(n.size)
      && !n.url.includes('DefaultMDS');
  }).reverse();
  if (albumArts.length) {
    res.cover = currentEvent.baseUrl + albumArts[0].url;
  }
  return res;
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
    return Promise.resolve();
  }
  if (!lastSong) {
    lastSong = {};
  }
  if (!res.channelMetadataResponse || !res.channelMetadataResponse.status) {
    return Promise.resolve();
  }
  const newSong = parseChannelMetadataResponse(res);
  if (badIds.includes(newSong.songId) || newSong.name[0] === '#') {
    return Promise.resolve();
  }
  if (lastSong.songId === newSong.songId) {
    return Promise.resolve();
  }
  // TODO: announce
  debug(newSong);
  return Promise.all([
    stream.insert(newSong),
    tracks.update(newSong),
  ]);
}

exports.checkEndpoint = checkEndpoint;
