const app = require('koa.io')();
const _ = require('lodash');
const moment = require('moment');
const MongoClient = require('mongodb');
const route = require('koa-route');
const cors = require('kcors');
const rp = require('request-promise');

const ep = require('./endpoints');
const config = require('./config');

let currentevent;
// http://www.siriusxm.com/metadata/pdt/en-us/json/channels/thebeat/timestamp/02-25-08:10:00
let sirius = '/metadata/pdt/en-us/json/channels/thebeat/timestamp/',
  badIds = ['^I', ''];

const database = new Promise((resolve) => {
  MongoClient.connect(config.db, {
    server: {
      poolSize: 5,
    },
    w: 0,
    native_parser: true,
    auto_reconnect: true,
  }, (err, database) => {
    if (err) throw err;
    resolve(database);
  });
});

app.use(cors());
// json middleware
app.use(function* (next) {
  this.type = 'json';
  this.db = yield database;
  yield next;
});

// routes
app.use(route.get('/recentBPM', ep.recentBPM));
app.use(route.get('/new', ep.newsongs));
app.use(route.get('/mostHeard', ep.mostHeard));
app.use(route.get('/artists', ep.allArtists));
app.use(route.get('/artist/:artist', ep.artists));
app.use(route.get('/song/:song', ep.songFromID));
app.use(route.get('/songstream/:song', ep.songstream));


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

function updateTrack(db, info) {
  app.io.emit('bpm', info);
  db.collection('stream').insert(info);
  db.collection('tracks').update({ xmSongID: info.xmSongID }, {
    $inc: { plays: 1 },
    $currentDate: { lastHeard: true },
    $set: { spotify: info.spotify },
    $setOnInsert: {
      firstHeard: moment.utc().toDate(),
      artists: info.artists,
      track: info.track,
      xmSongID: info.xmSongID,
    },
  }, {
    upsert: true,
  });
}

function newSong(db, artists, track, xmInfo) {
  console.log(artists);
  console.log(track);
  const info = {
    spotify: {},
    artists: artists.split('#')[0].split('/'),
    track: track.split('#')[0],
    xmSongID: xmInfo.song.id,
    heard: moment.utc().toDate(),
  };
  artists = artists.split('#')[0].replace(/[\s\/\\()]/g, '+');
  track = track.split('#')[0].replace(/[\s\/\\()]/g, '+');
    // do spotify for everything for a little while since it was broken
  spotify(artists, track, info).then((info) => {
    updateTrack(db, info);
  });
    // db.collection('tracks').find({xmSongID: info.xmSongID}).limit(1).next(function(err, doc) {
    //     if (doc) {
    //         info.spotify = doc.spotify;
    //         updateTrack(db, info);
    //     } else {
    //         spotify(artists, track, info).then(info => {
    //             updateTrack(db, info);
    //         });
    //     }
    // });
}

function getLastStreamed(db) {
  return new Promise((resolve) => {
    db.collection('stream').find({}).sort({ $natural: -1 }).limit(1)
      .next((err, doc) => {
        if (doc) {
          resolve(doc);
        }
        resolve({});
      });
  });
}

function checkEndpoint() {
  const datetime = moment.utc().subtract(1, 'minute').format('MM-DD-HH:mm:00');
  console.log(sirius + datetime);
  const options = {
    uri: `http://www.siriusxm.com${sirius}${datetime}`,
    json: true,
  };
  database.then((db) => {
    return Promise.all([db, getLastStreamed(db), rp(options)]);
  }).then((obj) => {
    const db = obj[0];
    const last = obj[1];
    const res = obj[2];
    let cur;
    try {
      cur = res.channelMetadataResponse.metaData.currentEvent;
    } catch (e) {
      console.log(e);
    }
    if (cur && res.channelMetadataResponse.messages.code !== 305 && cur.song.id !== currentevent && last.xmSongID !== cur.song.id) {
      currentevent = cur.song.id;
      if (badIds.indexOf(cur.song.id) === -1) {
        newSong(db, cur.artists.name, cur.song.name, cur);
      }
    }
  });
}

// init application
checkEndpoint();
setInterval(checkEndpoint, 20 * 1000);
app.listen(5000);
