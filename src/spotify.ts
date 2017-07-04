import * as request from 'request-promise-native';
import * as _ from 'lodash';

import { Track, Spotify, Artist, TrackInstance } from '../models';
import { findOrCreateTrack } from './tracks';
import { encode } from '../src/util';
import config from '../config';
import { client, getCache } from './redis';

export function parseSpotify(obj: any) {
  const cover = _.first<any>(obj.album.images) || {};
  return {
    cover: cover.url,
    spotifyId: obj.id,
    spotifyName: obj.name,
    durationMs: obj.duration_ms,
    url: obj.external_urls.spotify,
  };
}

export async function getToken(): Promise<string> {
  const cache = await getCache('spotifytoken:cache');
  if (cache) {
    return cache;
  }
  const auth = new Buffer(`${config.spotifyClientId}:${config.spotifyClientSecret}`).toString('base64');
  const options: request.Options = {
    uri: 'https://accounts.spotify.com/api/token',
    headers: { Authorization: `Basic ${auth}` },
    form: { grant_type: 'client_credentials' },
    json: true,
    gzip: true,
  };
  const res = await request.post(options);
  client.setex('spotifytoken:cache', res.expires_in - 100, res.access_token);
  return res.access_token;
}

export async function searchTrack(artists: string[], name: string) {
  const a = artists.join('+').replace('&', '');
  let t = name
    .replace(/\([0-9]+\)/, '')
    .replace('(', '')
    .replace(')', '')
    .replace('-', ' ')
    .replace('/', ' ')
    .replace(/(f((eat)|t)?)(\.)/i, '')
    .replace('w/', '')
    .replace(/(rem|re|mix)+\b/i, 'remix')
    .replace('  ', ' ');
  const token = await getToken();
  const options: request.Options = {
    uri: `https://api.spotify.com/v1/search`,
    qs: {
      q: `${a} ${t}`,
      type: 'track',
      limit: 1,
    },
    headers: { Authorization: `Bearer ${token}` },
    json: true,
    gzip: true,
  };
  const res = await request.get(options);
  if (res.tracks.items.length > 0) {
    return parseSpotify(_.first(res.tracks.items));
  }
  t = t.split('-')[0];
  options.qs.q = t;
  const res2 = await request.get(options);
  if (res2.tracks.items.length > 0) {
    return parseSpotify(_.first(res2.tracks.items));
  }
  options.qs.q = a;
  const res3 = await request.get(options);
  if (res3.tracks.items.length > 0) {
    return parseSpotify(_.first(res3.tracks.items));
  }
  return Promise.reject('failed');
}

export async function spotifyFindAndCache(trackId: number) {
  const doc = await Spotify.findOne({ where: { trackId } });
  if (doc) {
    return doc;
  }
  const trackInstance = await Track.findById(trackId, { include: [{ model: Artist }] });
  const track = trackInstance.toJSON();
  let search;
  try {
    search = await searchTrack(track.artists.map((n) => n.name), track.name);
  } catch (e) {
    return Promise.reject(e);
  }
  await Spotify.create({
    trackId,
    cover: search.cover,
    durationMs: search.durationMs,
    spotifyId: search.spotifyId,
    spotifyName: search.spotifyName,
    url: search.url,
  }, { returning: false });
  return search;
}

export async function getUserToken(code: string): Promise<string> {
  const cache = await getCache('spotifyusertoken:cache');
  if (cache) {
    return cache;
  }
  const auth = new Buffer(`${config.spotifyClientId}:${config.spotifyClientSecret}`).toString('base64');
  const options: request.Options = {
    uri: 'https://accounts.spotify.com/api/token',
    headers: { Authorization: `Basic ${auth}` },
    form: {
      redirect_uri: `${config.location}/updatePlaylist`,
      grant_type: 'authorization_code',
      code,
      state: 'xmplaylist',
    },
    json: true,
    gzip: true,
  };
  const res = await request.post(options);
  client.setex('spotifyusertoken:cache', res.expires_in - 100, res.access_token);
  return res.access_token;
}

function sleep(ms = 0) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function addToPlaylist(code: string, playlistId: string, trackIds: string[]) {
  const token = await getUserToken(code);
  const options: request.Options = {
    uri: `https://api.spotify.com/v1/users/xmplaylist/playlists/${playlistId}/tracks`,
    body: {
      uris: [],
    },
    headers: { Authorization: `Bearer ${token}` },
    json: true,
    gzip: true,
  };
  let first = true;
  const chunks = _.chunk(trackIds, 100);
  for (const chunk of chunks) {
    options.body.uris = chunk;
    if (first) {
      first = false;
      await request.put(options);
      continue;
    }
    await request.post(options);
  }
}
