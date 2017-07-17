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

export default function sleep(duration: number) {
  return new Promise((resolve, reject) => {
    setTimeout(() => { resolve(0); }, duration);
  });
}

async function updateAll() {
  while (true) {
    for (const channel of channels) {
      await checkEndpoint(channel).catch((e) => catchError(e));
      await sleep(300);
    }
  }
}

if (!module.parent) {
  log('cron running');
  updateAll().catch((e) => catchError(e));
}

function catchError(err: Error) {
  log(err);
  sentry.captureException(err);
}

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});
