import { Play, Track, ArtistTrack } from '../models';
import { subDays } from 'date-fns';
import { Op } from 'sequelize';

async function loop() {
  const old = subDays(new Date(), 120);
  const query1 = {
    where: {
      startTime: { [Op.lte]: old },
    },
  };
  const playDeleted = await Play.count(query1);
  console.log('playDeleted', playDeleted);
  if (playDeleted > 0) {
    await Play.destroy(query1);
  }

  const query2 = {
    where: {
      updatedAt: { [Op.lte]: old },
    },
  };
  const trackDeleted = await Track.count(query2);
  console.log('trackDeleted', trackDeleted);
  if (trackDeleted > 0) {
    await Track.destroy(query2);
  }

  const query3 = {
    where: {
      trackId: { [Op.eq]: null },
    },
  };
  const artistTrackDeleted = await ArtistTrack.count(query3);
  console.log('artistTrackDeleted', artistTrackDeleted);
  if (artistTrackDeleted > 0) {
    await ArtistTrack.destroy(query3);
  }
}

loop()
  .then(() => process.exit())
  .catch((e) => console.error(e));
