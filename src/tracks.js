const mongo = require('./mongo');

async function insert(doc) {
  // TODO: spotify
  const db = await mongo;
  return db.collection('tracks')
    .update({ songId: doc.songId }, {
      $inc: { plays: 1 },
      $currentDate: { lastHeard: true },
      // $set: { spotify: doc.spotify },
      $setOnInsert: {
        firstHeard: doc.startTime,
        artists: doc.artists,
        name: doc.name,
        songId: doc.songId,
      },
    },
    { upsert: true }
  );
}

exports.insert = insert;
