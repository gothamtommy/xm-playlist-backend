import { Track, Artist, ArtistTrack, Play, Spotify } from './index';

function sleep(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function setup(force = false): any {
  const opt = { force };
  return Track.sync(opt)
    .then(() => Artist.sync(opt))
    .then(() => ArtistTrack.sync(opt))
    .then(() => Play.sync(opt))
    .then(() => Spotify.sync(opt))
    .then(() => sleep(2000));
}

if (!module.parent) {
  setup().then(() => process.exit());
}
