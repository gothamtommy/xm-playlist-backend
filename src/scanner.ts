import * as debug from 'debug';
import * as Raven from 'raven';
import * as delay from 'delay';
import * as pForever from 'p-forever';

import { checkEndpoint } from './sirius';
import { channels } from './channels';
import config from '../config';

const log = debug('xmplaylist');

const sentry = Raven.config(config.dsn, { autoBreadcrumbs: false });

async function updateAll() {
  for (const channel of channels) {
    await checkEndpoint(channel).catch((e: Error) => catchError(e));
    await delay(300);
  }
  return updateAll();
}

if (!module.parent) {
  log('cron running');
  pForever(() => updateAll()).catch((e: Error) => catchError(e));
}

function catchError(err: Error) {
  log(err);
  sentry.captureException(err);
  process.exit(0);
}
