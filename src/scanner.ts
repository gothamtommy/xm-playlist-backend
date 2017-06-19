import * as debug from 'debug';
import * as Raven from 'raven';

import { checkEndpoint } from './sirius';
import { channels } from './channels';
import config from '../config';

const log = debug('xmplaylist');

if (config.dsn) {
  const sentry = Raven
    .config(config.dsn, { autoBreadcrumbs: true })
    .install({ captureUnhandledRejections: true });
}

async function updateAll() {
  for (const channel of channels) {
    await checkEndpoint(channel);
  }
  setTimeout(() => updateAll(), 5000);
}

if (!module.parent) {
  log('cron running');
  updateAll();
}
