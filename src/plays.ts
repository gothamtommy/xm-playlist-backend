import * as sequelize from 'sequelize';
import * as _ from 'lodash';
import { subDays, format } from 'date-fns';

import { Play, PlayAttributes, PlayInstance, Track, Artist, sequelize as s } from '../models';
import { Channel } from './channels';

export async function getLast(channel: Channel): Promise<any> {
  return await Play
    .findOne({
      where: { channel: channel.number },
      order: [['startTime', 'DESC']],
      include: [{ model: Track }],
    });
}

export async function getRecent(channel: Channel, last?: Date) {
  const where: any = { channel: channel.number };
  if (last) {
    where.startTime = { $lt: last };
  }
  return await Play
    .findAll({
      where,
      order: [['startTime', 'DESC']],
      include: [{ model: Track, include: [{ model: Artist }] }],
      limit: 15,
    })
    .then((n) => n.map((x) => x.toJSON()));
}

export async function mostHeard(channel: Channel) {
  const date = format(subDays(new Date(), 1), 'YYYY-MM-DD HH:mm:ss');
  const trackAndCount: any = await s.query(`
    SELECT "trackId", count('play.trackId') AS "playCount"
    FROM "plays" AS "play"
    WHERE "play"."channel" = ${channel.number}
      AND "startTime" > '${date}'
    GROUP BY "play"."trackId"
    ORDER BY "playCount" DESC LIMIT 20;
    `).spread((results, metadata) => {
      return results;
    });
  const trackIds = trackAndCount.map((n) => n.trackId);
  const tracks = await Track
    .findAll({
      where: { id: {$in: trackIds } },
      include: [{ model: Artist }],
    })
    .then((n) => n.map((x) => x.toJSON()));
  return tracks.map((n: any) => {
    n.playCount = _.find(trackAndCount, _.matchesProperty('trackId', n.id)).playCount;
    n.playCount = Number(n.playCount);
    return n;
  });
  // const db = await mongo;
  // return db.collection('stream')
  //   .aggregate([
  //     { $match: {
  //       startTime: { $gte: date },
  //       channelId: channel.id,
  //     } },
  //     { $group: {
  //       _id: '$songId',
  //       count: { $sum: 1 },
  //       songId: { $first: '$songId' },
  //       name: { $first: '$name' },
  //       artistsId: { $first: '$artistsId' },
  //       artists: { $first: '$artists' },
  //     } },
  //     { $sort: { count: -1 } },
  //   ])
  //   .toArray();
}
