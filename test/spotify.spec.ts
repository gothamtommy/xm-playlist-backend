import * as chai from 'chai';

import { searchTrack } from '../src/spotify';
import { setup } from '../models/dbinit';

const expect = chai.expect;

beforeAll(function() {
  return setup(true);
});

describe('spotify', function() {
  it('should find Say My Name', async function() {
    const name = 'Say My Name (Remix)';
    const artists = ['ODESZA', 'Cedric Gervais', 'Zyra'];
    const res = await searchTrack(artists, name);
    expect(res.spotifyId).to.eq('1gNj8JoisgQZQmrcpfx9E5');
  });
  it('should find Cold Water', async function() {
    const name = 'Cold Water-Lost Frequencies Remix';
    const artists = ['Justin Bieber', 'Major Lazer', 'MO'];
    const res = await searchTrack(artists, name);
    expect(res.spotifyId).to.eq('4HMfSzk0UsiRhulF0eb1M9');
  });
  it('should find Felt This Good', async function() {
    const name = 'Felt This Good';
    const artists = ['Kap Slap', 'M Bronx'];
    const res = await searchTrack(artists, name);
    expect(res.spotifyId).to.eq('5A4e3eCE4N7tZFRdmJz0rF');
  });
  it('should find Feel Your Love', async function() {
    const name = 'Feel Your Love';
    const artists = ['Flux Pavillion', 'NGHTMRE'];
    const res = await searchTrack(artists, name);
    expect(res.spotifyId).to.eq('0YzwCpQVGtg4P2oFAC95bm');
  });
  it('should find The Right Song', async function() {
    const name = 'The Right Song';
    const artists = ['Tiesto', 'Oliver Heldens', 'Natalie LaRos'];
    const res = await searchTrack(artists, name);
    expect(res.spotifyId).to.eq('6Jao8qdCB3VYG4PhPzCEIm');
  });
  it('should find False Alarm-Hook N Sling Mix', async function() {
    const name = 'False Alarm-Hook N Sling Mix';
    const artists = ['Matoma'];
    const res = await searchTrack(artists, name);
    expect(res.spotifyId).to.eq('7FWSYDL3TOu0Q4fzBdx3F5');
  });
  it('should find Closer (R3HAB Mix)', async function() {
    const name = 'Closer (R3HAB Mix)';
    const artists = ['The Chainsmokers', 'Halsey'];
    const res = await searchTrack(artists, name);
    expect(res.spotifyId).to.eq('0Ye1olMyvB2rLjZ4vlYVWI');
  });
  it('should find Crash 2.0', async function() {
    const name = 'Crash 2.0-Dave Dresden Edit';
    const artists = ['Adventure Club vs. DallasK'];
    const res = await searchTrack(artists, name);
    expect(res.spotifyId).to.eq('27aftq9i01N0yVKZyimwlG');
  });
  it('should find Falling', async function() {
    const name = 'Falling';
    const artists = ['Alesso'];
    const res = await searchTrack(artists, name);
    expect(res.spotifyId).to.eq('43mNwDn0zOH2HKl5B4aqcx');
  });
  it('should find Rush Over Me FT', async function() {
    const name = 'Rush Over Me (ft. HALIENE)';
    const artists = ['Illenium', 'SevenLions', 'SaidTheSky'];
    const res = await searchTrack(artists, name);
    expect(res.spotifyId).to.eq('2z50GlkP7GinGZauNHwD7j');
  });
  it('should find Rush Over Me f.', async function() {
    const name = 'Another Life (f.Ester Dean)';
    const artists = ['David Guetta', 'Afrojack'];
    const res = await searchTrack(artists, name);
    expect(res.spotifyId).to.eq('0AOEd0Zw22aTE8LzsS4EMg');
  });
});
