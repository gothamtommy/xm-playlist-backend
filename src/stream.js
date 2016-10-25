const mongo = require('./mongo');

async function getLast(channel) {
  const db = await mongo;
  return db.collection('stream')
    .findOne({ channelId: channel.id }, {
      sort: { $natural: -1 },
    });
}

async function insert(doc) {
  const db = await mongo;
  return db.collection('stream').insert(doc);
}

exports.getLast = getLast;
exports.insert = insert;
