const debug = require('debug')('xmplaylist');
const moment = require('moment');
const rp = require('request-promise-native');
const _ = require('lodash');

const stream = require('./stream');
const channels = require('./channels');

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
    channelName: meta.channelName,
    channelNumber: meta.channelNumber,
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
    uri: `${baseurl}/metadata/pdt/en-us/json/channels/${channel.channel}/timestamp/${dateString}`,
    json: true,
  };
  console.log(opt.uri);
  let res;
  let lastSong;
  try {
    [res, lastSong] = await Promise.all([rp(opt), stream.getLast(channel)]);
    if (!lastSong) {
      lastSong = {};
    }
  } catch (e) {
    return;
  }
  if (res.status) {
    return;
  }
  let newSong;
  try {
    newSong = parseChannelMetadataResponse(res);
  } catch (e) {
    console.log('Parse Failed', e);
    return;
  }
  if (lastSong.songId === newSong.songId) {
    return;
  }
  // TODO: announce
  console.log(newSong);
  await stream.insert(newSong);
}

setInterval(() => checkEndpoint(channels[0]), 10000);


function spotify(artists, track, info) {
  const uri = `https://api.spotify.com/v1/search?q=artist:${artists}+track:${track}&type=track`;
  console.log(uri);
  const options = {
    uri,
    json: true,
  };
  return rp(options).then((res) => {
    const chosen = _.maxBy(res.tracks.items, 'popularity');
    if (chosen) {
      info.spotify.artists = _.map(chosen.artists, 'name');
      info.spotify.name = chosen.name;
      info.spotify.url = chosen.external_urls.spotify;
      info.spotify.album_image = chosen.album.images[0].url;
      info.spotify.album = chosen.album.name;
    }
    return info;
  });
}


