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
    await checkEndpoint(channel).catch((e) => catchError(e));
  }
}

if (!module.parent) {
  log('cron running');
  setInterval(async () => await updateAll().catch((e) => catchError(e)), 9000);
}

function catchError(err: Error) {
  log(err);
  sentry.captureException(err);
}
