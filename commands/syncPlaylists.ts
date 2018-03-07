import * as puppeteer from 'puppeteer';
import * as querystring from 'querystring';
import * as Raven from 'raven';
import * as url from 'url';

import config from '../config';
import { updatePlaylists } from '../src/spotify';

const sentry = Raven.config(config.dsn, { autoBreadcrumbs: false }).install();

async function main() {
  let browser: puppeteer.Browser;
  let code: string;
  const path = `https://accounts.spotify.com/authorize?client_id=${
    config.spotifyClientId
  }&response_type=code&redirect_uri=https://example.com/&scope=playlist-modify-public&state=xmplaylist`;
  try {
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.goto(path, { waitUntil: 'networkidle2' });
    await page.click('.btn,.btn-sm');
    await page.type('input#login-username', config.spotifyUsername);
    await page.type('input#login-password', config.spotifyPassword);
    await page.click('.btn-green');
    const res = await page.waitForNavigation();
    const codeUrl = await res.url();
    const qs: any = querystring.parse(url.parse(codeUrl).query);
    code = qs.code;
  } catch (err) {
    console.error(err);
    sentry.captureException(err);
    throw err;
  } finally {
    if (browser) {
      browser.close();
    }
  }
  if (!code) {
    throw new Error('No update code');
  }
  try {
    await updatePlaylists(code);
  } catch (err) {
    console.error(err);
    sentry.captureException(err);
    throw err;
  }
  console.log('success');
}

main()
  .then(() => process.exit())
  .catch((e) => console.error(e));
