const mongo = require('./mongo');

async function update(doc) {
  const db = await mongo;
  return db.collection('tracks')
    .updateOne({ songId: doc.songId }, {
      $inc: { plays: 1 },
      $currentDate: { lastHeard: true },
      $setOnInsert: {
        firstHeard: doc.startTime,
        artists: doc.artists,
        artistsId: doc.artistsId,
        name: doc.name,
        songId: doc.songId,
      },
    },
    { upsert: true },
  );
}

async function artists() {
  const db = await mongo;
  return db.collection('tracks')
    .distinct('artists');
}

async function getTrack(songId) {
  const db = await mongo;
  return db.collection('tracks')
    .findOne({ songId });
}

exports.update = update;
exports.artists = artists;
exports.getTrack = getTrack;
