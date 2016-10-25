const moment = require('moment');
const JSONStream = require('JSONStream');
// 
// async function recentBPM(ctx, next) {
//   const date = moment().subtract(1, 'days').toDate();
//   this.body = this.db.collection('stream')
//     .find({ heard: { $gt: date } })
//     .sort({ $natural: -1 })
//     .stream()
//     .pipe(JSONStream.stringify());
//   yield next;
// }
// async function newsongs(ctx, next) {
//   this.body = this.db.collection('tracks')
//     .find({}).sort({ $natural: -1 })
//     .limit(100)
//     .stream()
//     .pipe(JSONStream.stringify());
//   yield next;
// }
// async function mostHeard(ctx, next) {
//   const date = moment().subtract(7, 'days').toDate();
//   this.body = this.db.collection('stream')
//     .aggregate([
//       { $match: { heard: { $gt: date } } },
//       { $group: {
//         _id: '$xmSongID',
//         count: { $sum: 1 },
//         xmSongID: { $first: '$xmSongID' },
//         track: { $first: '$track' },
//         spotify: { $first: '$spotify' },
//         artists: { $first: '$artists' },
//         heard: { $first: '$heard' } } },
//       { $sort: { count: -1 } },
//       { $limit: 100 },
//     ])
//     .stream()
//     .pipe(JSONStream.stringify());
//   yield next;
// }
// async function artists(artist, next) {
//   this.body = this.db.collection('tracks')
//     .find({ artists: artist })
//     .stream()
//     .pipe(JSONStream.stringify());
//   yield next;
// }
// function distinctArtists(db) {
//   return new Promise((resolve) => {
//     db.collection('tracks').distinct('artists', (err, doc) => {
//       resolve(doc);
//     });
//   });
// }
// async function allArtists(ctx, next) {
//   this.body = yield distinctArtists(this.db);
//   yield next;
// }
// async function songFromID(song, next) {
//   this.body = this.db.collection('tracks')
//     .find({ xmSongID: song.replace('-', '#') })
//     .limit(1)
//     .stream()
//     .pipe(JSONStream.stringify());
//   yield next;
// }
// async function songstream(song, next) {
//   const songID = song.replace('-', '#');
//   this.body = this.db.collection('stream')
//     .aggregate([
//       { $match: { xmSongID: songID } },
//       { $group: {
//         _id: {
//           month: { $month: '$heard' },
//           day: { $dayOfMonth: '$heard' },
//           year: { $year: '$heard' },
//         },
//         count: { $sum: 1 } },
//       },
//     ])
//     .stream()
//     .pipe(JSONStream.stringify());
//   yield next;
// }
// exports.recentBPM = recentBPM;
// exports.newsongs = newsongs;
// exports.mostHeard = mostHeard;
// exports.artists = artists;
// exports.allArtists = allArtists;
// exports.songFromID = songFromID;
// exports.songstream = songstream;
