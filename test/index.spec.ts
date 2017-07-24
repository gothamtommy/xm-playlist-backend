import * as nock from 'nock';
import * as supertest from 'supertest';
import channelMetadataResponse from './mock/channelMetadataResponse';

import app from '../src/index';
import { setup } from '../models/dbinit';
import { insertPlay } from '../src/sirius';

const play = {
  channelId: '90salternative',
  channelName: 'Lithium',
  channelNumber: 34,
  name: 'Man In The Box',
  artists: ['Alice In Chains'],
  artistsId: 'Jd',
  startTime: new Date('2017-06-29T05:58:17.000Z'),
  songId: 'JE84MGF3',
};

const channel = {
  id: '90salternative',
  number: 34,
  name: 'Lithium',
  genre: 'Rock',
  desc: "'90s Alternative/Grunge",
};

beforeAll(async function(done) {
  await setup(true);
  done();
});

describe('index', function() {
  it('should parse metadata response', async function() {
    const t = await insertPlay(play, channel);
    const res = await supertest(app.listen())
      .get('/channel/90salternative')
      .expect(200);
    expect(res.body.length).toBe(1);
  });
});
