const expect = require('chai').expect;

const spotify = require('../../src/spotify');


describe('SPOTIFY', function () {
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
});
