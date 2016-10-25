const debug = require('debug')('xmplaylist:index');
const createThrottle = require('async-throttle');
const _ = require('lodash');

// const config = require('../config');
const sirius = require('./sirius');
const channels = require('./channels');

async function updateAll() {
  const throttle = createThrottle(2);
  const res = await Promise.all(channels.map(channel => throttle(async () => {
    debug('Processing', channel);
    await sirius.checkEndpoint(channel);
  })));
  debug('FINISHED', _.compact(res).length);
}

if (!module.parent) {
  setInterval(() => updateAll(), 10000);
}
