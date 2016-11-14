// async function newsongs(ctx, next) {
//   this.body = this.db.collection('tracks')
//     .find({}).sort({ $natural: -1 })
//     .limit(100)
//     .stream()
//     .pipe(JSONStream.stringify());
//   yield next;
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
