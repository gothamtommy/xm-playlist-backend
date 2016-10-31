const expect = require('chai').expect;

const spotify = require('../../src/spotify');


describe('spotify', function () {
  it('should find Say My Name', async function () {
    const stream = {
      name: 'Say My Name (Remix)',
      artists: ['ODESZA', 'Cedric Gervais', 'Zyra'],
    };
    const res = await spotify.searchTrack(stream);
    expect(res.spotifyId).to.eq('1gNj8JoisgQZQmrcpfx9E5');
  });
  it('should find Cold Water', async function () {
    const stream = {
      name: 'Cold Water-Lost Frequencies Remix',
      artists: ['Justin Bieber', 'Major Lazer', 'MO'],
    };
    const res = await spotify.searchTrack(stream);
    expect(res.spotifyId).to.eq('4HMfSzk0UsiRhulF0eb1M9');
  });
  it('should find Felt This Good', async function () {
    const stream = {
      name: 'Felt This Good',
      artists: ['Kap Slap', 'M Bronx'],
    };
    const res = await spotify.searchTrack(stream);
    expect(res.spotifyId).to.eq('5A4e3eCE4N7tZFRdmJz0rF');
  });
  it('should find Feel Your Love', async function () {
    const stream = {
      name: 'Feel Your Love',
      artists: ['Flux Pavillion', 'NGHTMRE'],
    };
    const res = await spotify.searchTrack(stream);
    expect(res.spotifyId).to.eq('5av9pOEpuRuUcxZ1y0s65P');
  });
  it('should find The Right Song', async function () {
    const stream = {
      name: 'The Right Song',
      artists: ['Tiesto', 'Oliver Heldens', 'Natalie LaRos'],
    };
    const res = await spotify.searchTrack(stream);
    expect(res.spotifyId).to.eq('6Jao8qdCB3VYG4PhPzCEIm');
  });
  it('should find False Alarm-Hook N Sling Mix', async function () {
    const stream = {
      name: 'False Alarm-Hook N Sling Mix',
      artists: ['Matoma'],
    };
    const res = await spotify.searchTrack(stream);
    expect(res.spotifyId).to.eq('7FWSYDL3TOu0Q4fzBdx3F5');
  });
});
