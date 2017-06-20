import * as debug from 'debug';
import * as Raven from 'raven';

import { checkEndpoint } from './sirius';
import { channels } from './channels';
import config from '../config';

const log = debug('xmplaylist');

const sentry = Raven.config(config.dsn, { autoBreadcrumbs: true });
if (config.dsn) {
  sentry.install({ captureUnhandledRejections: true });
}

async function updateAll() {
  for (const channel of channels) {
    await checkEndpoint(channel);
  }
  setTimeout(() => updateAll().catch((e) => catchError(e)), 5000);
}

if (!module.parent) {
  log('cron running');
  updateAll().catch((e) => catchError(e));
}

function catchError(err: Error) {
  sentry.captureException(err);
  log(err);
}
