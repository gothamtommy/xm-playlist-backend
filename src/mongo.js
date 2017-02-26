const MongoClient = require('mongodb');
const log = require('debug')('xmplaylist');

const config = require('../config');

const db = new Promise((resolve) => {
  log('Connecting to database');
  resolve(MongoClient.connect(config.db));
});
module.exports = db;
