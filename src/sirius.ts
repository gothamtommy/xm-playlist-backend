import * as debug from 'debug';
import * as request from 'request-promise-native';
import * as _ from 'lodash';
import { format as dateFmt } from 'date-fns';

// import { findOrCreateTrack } from './tracks';
import { getLast } from './plays';
import { Track, ArtistTrack, Play, ArtistTrackInstance, Artist, TrackAttributes } from '../models';
import { channels, Channel } from './channels';
import { encode } from './util';
import { spotifyFindAndCache } from './spotify';

// https://www.siriusxm.com/metadata/pdt/en-us/json/channels/thebeat/timestamp/02-25-08:10:00
const baseurl = 'https://www.siriusxm.com';
const log = debug('xmplaylist');

export function parseArtists(artists: string): string[] {
  // splits artists into an array
  return artists.match(/(?:\/\\|[^/\\])+/g);
}
export function parseName(name: string) {
  return name.split(' #')[0];
}

export function parseChannelMetadataResponse(meta: any, currentEvent: any) {
  const artists = parseArtists(String(currentEvent.artists.name));
  const name = parseName(String(currentEvent.song.name));
  const songId = String(currentEvent.song.id);
  return {
    channelId: meta.channelId,
    channelName: meta.channelName,
    channelNumber: meta.channelNumber,
    name,
    artists,
    artistsId: currentEvent.artists.id,
    startTime: new Date(currentEvent.startTime),
    songId: songId.replace(/#/g, '!'),
  };
}

export async function checkEndpoint(channel: Channel) {
  const now = new Date();
  const utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
  const dateString = dateFmt(utc, 'MM-DD-HH:mm:00');
  const url = `${baseurl}/metadata/pdt/en-us/json/channels/${channel.id}/timestamp/${dateString}`;
  log(url);
  let res;
  try {
    res = await request.get(url, { json: true, gzip: true, simple: true });
  } catch (e) {
    return false;
  }
  if (!res.channelMetadataResponse || !res.channelMetadataResponse.status) {
    return false;
  }
  const meta = res.channelMetadataResponse.metaData;
  const currentEvent = meta.currentEvent;
  if (
    !currentEvent.song ||
    !currentEvent.song.id ||
    !currentEvent.artists ||
    !currentEvent.artists.id ||
    !currentEvent.artists.name ||
    !currentEvent.song.name
  ) {
    return false;
  }

  const newSong = parseChannelMetadataResponse(meta, currentEvent);
  if (['^I', ''].includes(newSong.songId) || newSong.name[0] === '#') {
    return false;
  }
  const last = await getLast(channel);
  newSong.songId = encode(newSong.songId);
  if (last && last.track.songId === newSong.songId) {
    return false;
  }
  const track = await insertPlay(newSong, channel);
  // TODO: announce
  log(newSong);
  try {
    if (process.env.NODE_ENV !== 'test') {
      spotifyFindAndCache(track);
    }
  } catch (e) {
    log(`${newSong.songId} not found on spotify`);
  }

  return true;
}

function findOrCreateArtists(artists: string[]) {
  const promises: Array<Promise<ArtistTrackInstance>> = artists.map((n): any  => {
    return Artist
      .findOrCreate({ where: { name: n }})
      .spread((artist: ArtistTrackInstance, created) => {
        return artist;
      });
  });
  return Promise.all(promises);
}

export async function insertPlay(data: any, channel: Channel): Promise<TrackAttributes> {
  const artists = await findOrCreateArtists(data.artists);
  const [track, created] = await Track
    .findOrCreate({ where: { songId: data.songId }, include: [Artist] });
  if (!created) {
    track.increment('plays');
  } else {
    await track.update({ name: data.name });
    const at = artists.map((artist) => {
      return {
        artistId: artist.get('id'),
        trackId: track.get('id'),
      };
    });
    await ArtistTrack.bulkCreate(at, { returning: false });
  }
  await Play.create(
    { channel: channel.number, trackId: track.get('id'), startTime: new Date(data.startTime) },
    { returning: false },
  );
  return track.toJSON();
}
