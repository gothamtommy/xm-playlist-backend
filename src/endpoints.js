// async function newsongs(ctx, next) {
//   this.body = this.db.collection('tracks')
//     .find({}).sort({ $natural: -1 })
//     .limit(100)
//     .stream()
//     .pipe(JSONStream.stringify());
//   yield next;
// }
