import * as nock from 'nock';
import * as _ from 'lodash';

import {
  checkEndpoint,
  parseName,
  parseArtists,
  parseChannelMetadataResponse,
} from '../src/sirius';
import { channels } from '../src/channels';
import channelMetadataInvalidId from './mock/channelMetadataInvalidId';
import channelMetadataResponse from './mock/channelMetadataResponse';
import channelMetadataResponse1 from './mock/channelMetadataResponse1';
import { setup } from '../models/dbinit';

const bpm = _.find(channels, _.matchesProperty('id', 'thebeat'));

beforeAll(async function(done) {
  await setup(true);
  done();
});

describe('sirius', function() {
  it('should parse metadata response', function() {
    const meta = channelMetadataResponse.channelMetadataResponse.metaData;
    const currentEvent = meta.currentEvent;
    const stream = parseChannelMetadataResponse(meta, currentEvent);
    expect(stream.name).toBe('Closer (R3HAB Mix)');
    expect(stream.songId).toBe('$O1FhQ');
    expect(stream.channelNumber).toBe(51);
    expect(stream.channelName).toBe('BPM');
    expect(stream.channelId).toBe('thebeat');
    expect(stream.artists.length).toBe(2);
    expect(stream.artistsId).toBe('FQv');
  });
  it('should parse artists', function() {
    const artists = parseArtists('Axwell/\\Ingrosso/Adventure Club vs. DallasK');
    expect(artists.length).toBe(2);
    expect(artists[0]).toBe('Axwell/\\Ingrosso');
  });
  it('should parse song name', function() {
    const name = parseName('Jupiter #bpmDebut');
    expect(name).toBe('Jupiter');
  });
  it('should get update from channel', async function() {
    await setup();
    const scope = nock('https://www.siriusxm.com')
      .get(/thebeat/)
      .reply(200, channelMetadataResponse);
    const res = await checkEndpoint(bpm);
    scope.done();
    expect(res).toBe(true);
  });
  it('should skip song that has already been recorded', async function() {
    await setup();
    const scope = nock('https://www.siriusxm.com')
      .get(/thebeat/)
      .times(2)
      .reply(200, channelMetadataResponse1);
    const res = await checkEndpoint(bpm);
    const res2 = await checkEndpoint(bpm);
    scope.done();
    expect(res).toBe(true);
    expect(res2).toBe(false);
  });
  it('should skip invalid id', async function() {
    await setup();
    const scope = nock('https://www.siriusxm.com')
      .get(/thebeat/)
      .reply(200, channelMetadataInvalidId);
    const res = await checkEndpoint(bpm);
    scope.done();
    expect(res).toBe(false);
  });
});
