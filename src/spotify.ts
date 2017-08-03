import * as debug from 'debug';
import * as request from 'request-promise-native';
import * as _ from 'lodash';
import * as Sequelize from 'sequelize';

import { Track, Spotify, Artist, TrackInstance, TrackAttributes, SpotifyAttributes } from '../models';
import config from '../config';
import { findOrCreateTrack } from './tracks';
import { encode } from '../src/util';
import * as Util from './util';
import { client, getCache } from './redis';
import { search } from './youtube';

const log = debug('xmplaylist');
const blacklist = [
  'karaoke',
  'tribute',
  'demonstration',
  'performance',
  'instrumental',
  'famous',
  'originally',
  'arrangement',
  'cover',
  'style',
  'acoustic',
];

export interface SpotifyParsed {
  cover: string;
  spotifyId: string;
  spotifyName: string;
  durationMs: number;
  url: string;
}
export function parseSpotify(obj: any): SpotifyParsed {
  const cover = _.first<any>(obj.album.images) || {};
  return {
    cover: cover.url,
    spotifyId: obj.id,
    spotifyName: obj.name,
    durationMs: obj.duration_ms,
    url: obj.external_urls.spotify,
  };
}

export function optionalBlacklist(track: string, artists: string) {
  let bl = '';
  const all = track.toLowerCase() + artists.toLowerCase();
  for (const b in blacklist) {
    if (all.includes(b)) {
      bl += ` NOT ${b}`;
    }
  }
  return bl;
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

export async function searchTrack(artists: string[], name: string): Promise<SpotifyParsed> {
  const cleanArtists = Util.cleanupExtra(Util.cleanCutoff(artists.join(' ')));
  const cleanTrack = Util.cleanupExtra(
    Util.cleanRemix(
      Util.cleanFt(
        Util.cleanClean(
          Util.cleanCutoff(
            Util.cleanYear(name),
          ),
        ),
      ),
    ),
  );
  // console.log('CLEAN: ', cleanTrack, cleanArtists);
  const token = await getToken();
  const options: request.Options = {
    uri: `https://api.spotify.com/v1/search`,
    qs: {
      q: `${cleanTrack} ${cleanArtists}` + optionalBlacklist(cleanTrack, cleanArtists),
      type: 'track',
      limit: 1,
    },
    headers: { Authorization: `Bearer ${token}` },
    json: true,
    gzip: true,
  };
  console.log('ORIGINAL:', options.qs.q);
  const res = await request.get(options);
  if (res.tracks.items.length > 0) {
    return parseSpotify(_.first(res.tracks.items));
  }
  const youtube = await search(`${cleanTrack} ${cleanArtists}`);
  if (!youtube) {
    return Promise.reject('Youtube failed');
  }
  options.qs.q = Util.cleanupExtra(
    Util.cleanRemix(
      Util.cleanFt(
        Util.cleanMusicVideo(youtube),
      ),
    ),
  ) + optionalBlacklist(cleanTrack, cleanArtists);
  console.log('GOOGLE:', options.qs.q);
  const res2 = await request.get(options);
  if (res2.tracks.items.length > 0) {
    return parseSpotify(_.first(res2.tracks.items));
  }
  return Promise.reject('Everything Failed');
}

export async function matchSpotify(track: TrackAttributes, update = false) {
  let s;
  try {
    s = await searchTrack(track.artists.map((n) => n.name), track.name);
  } catch (e) {
    return Promise.reject(e);
  }
  if (!s || !s.spotifyName) {
    return Promise.reject('Failed');
  }
  if (update) {
    return Spotify.findOne({ where: { trackId: track.id } }).then((doc) => doc.update({
      trackId: track.id,
      cover: s.cover,
      durationMs: s.durationMs,
      spotifyId: s.spotifyId,
      spotifyName: s.spotifyName,
      url: s.url,
    }));
  }
  return Spotify.create({
    trackId: track.id,
    cover: s.cover,
    durationMs: s.durationMs,
    spotifyId: s.spotifyId,
    spotifyName: s.spotifyName,
    url: s.url,
  });
}

export async function spotifyFindAndCache(track: TrackAttributes) {
  const doc = await Spotify.findOne({ where: { trackId: track.id } });
  if (doc) {
    return doc;
  }
  return matchSpotify(track);
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
