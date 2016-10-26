const moment = require('moment');

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

async function getRecent(channel) {
  const db = await mongo;
  const date = moment().subtract(1, 'days').toDate();
  return db.collection('stream')
    .find({
      channelId: channel.id,
      startTime: { $gt: date },
    }, {
      sort: { $natural: -1 },
    })
    .toArray();
}

exports.getLast = getLast;
exports.insert = insert;
exports.getRecent = getRecent;
