const MongoClient = require('mongodb');

const config = require('../config');

module.exports = MongoClient.connect(config.db, {
  server: {
    poolSize: 5,
  },
  w: 0,
  auto_reconnect: true,
});
