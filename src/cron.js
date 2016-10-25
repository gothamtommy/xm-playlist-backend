const rp = require('request-promise-native');

const config = require('../config');

setInterval(() => {
  return rp(`http://localhost:${config.port}/update`)
    .catch((e) => {
      console.log(e);
    });
}, 5000);

