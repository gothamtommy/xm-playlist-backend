const MongoClient = require('mongodb');

const config = require('../config');

module.exports = new Promise((resolve) => {
  MongoClient.connect(config.db, {
    server: {
      poolSize: 5,
    },
    w: 0,
    auto_reconnect: true,
  }, (err, database) => {
    if (err) throw err;
    resolve(database);
  });
});
