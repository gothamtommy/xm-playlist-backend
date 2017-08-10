import * as sequelize from 'sequelize';
import * as debug from 'debug';
import { subDays, addDays, startOfDay, setHours } from 'date-fns';

import {
  Track,
  Artist,
  ArtistTrack,
  ArtistTrackInstance,
  Play,
} from '../models';
import { encode } from '../src/util';

const log = debug('xmplaylist');

export function findOrCreateArtists(artists: string[]): Promise<any[]> {
  const promises: Array<
    Promise<ArtistTrackInstance>
  > = artists.map(async (name): Promise<any> => {
    const artist = await Artist.findOne({ where: { name } });
    if (artist) {
      return artist;
    }
    return Artist.create({ name });
  });
  return Promise.all(promises);
}

export async function findOrCreateTrack(data) {
  const artists = await findOrCreateArtists(data.artists);
  const [track, created] = await Track.findOrCreate({
    where: {
      songId: encode(data.songId),
    },
  });
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
}

export async function playsByDay(trackId: number) {
  let daysago = subDays(new Date(), 30);
  const plays: any = await Play.findAll({
    where: { trackId, startTime: { $gt: daysago } },
    attributes: [
      [sequelize.fn('date_trunc', 'day', sequelize.col('startTime')), 'day'],
      [sequelize.fn('COUNT', 'trackId'), 'count'],
    ],
    group: ['day'],
    order: [sequelize.col('day')],
  }).then((t) => t.map((n) => n.toJSON()));
  let hasZero = false;
  for (let i = 0; i <= 30; i++) {
    const str = daysago.toISOString().split('T')[0] + 'T00:00:00.000Z';
    if (!plays[i] || str !== new Date(plays[i].day).toISOString()) {
      plays.splice(i, 0, {
        day: str,
        count: 0,
      });
    }
    plays[i].count = Number(plays[i].count);
    if (!hasZero && plays[i].count === 0) {
      hasZero = true;
    }
    daysago = addDays(daysago, 1);
  }
  if (!hasZero) {
    plays[0].count = 0;
  }
  return plays;
}
