const debug = require('debug')('xmplaylist');
const createThrottle = require('async-throttle');

const sirius = require('./sirius');
const channels = require('./channels');


function updateAll() {
  const throttle = createThrottle(1);
  return Promise.all(channels.map(channel => throttle(() => {
    debug('Processing', channel);
    return sirius.checkEndpoint(channel);
  })));
}

if (!module.parent) {
  debug('cron running');
  setInterval(() => updateAll(), 15000);
}
