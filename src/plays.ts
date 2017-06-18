import * as moment from 'moment';

import { Play, PlayAttributes, Track, Artist } from '../models';
import { Channel } from './channels';

export async function getLast(channel: Channel) {
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
  return await Play.findAll({
    where,
    order: [['startTime', 'DESC']],
    include: [{ model: Track, include: [{ model: Artist }] }],
    limit: 15,
  });
}

export async function mostHeard(channel) {
  // TODO: group
  return await Play.findAll();
  // const db = await mongo;
  // const date = moment().subtract(1, 'days').toDate();
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
