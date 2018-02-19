import { expect } from 'chai';
import * as _ from 'lodash';
import * as nock from 'nock';

import { setup } from '../models/dbinit';
import { channels } from '../src/channels';
import {
  checkEndpoint,
  parseArtists,
  parseChannelMetadataResponse,
  parseName,
} from '../src/sirius';
import channelMetadataInvalidId from './mock/channelMetadataInvalidId';
import channelMetadataResponse from './mock/channelMetadataResponse';
import channelMetadataResponse1 from './mock/channelMetadataResponse1';

const bpm = channels.find(_.matchesProperty('id', 'thebeat'));

describe('sirius', function() {
  beforeEach(function() {
    this.timeout(10000);
    return setup(true);
  });
  it('should parse metadata response', function() {
    const meta = channelMetadataResponse.channelMetadataResponse.metaData;
    const currentEvent = meta.currentEvent;
    const stream = parseChannelMetadataResponse(meta, currentEvent);
    expect(stream.name).to.eq('Closer (R3HAB Mix)');
    expect(stream.songId).to.eq('$O1FhQ');
    expect(stream.channelNumber).to.eq(51);
    expect(stream.channelName).to.eq('BPM');
    expect(stream.channelId).to.eq('thebeat');
    expect(stream.artists.length).to.eq(2);
    expect(stream.artistsId).to.eq('FQv');
  });
  it('should parse artists', function() {
    const artists = parseArtists('Axwell/\\Ingrosso/Adventure Club vs. DallasK');
    expect(artists.length).to.eq(2);
    expect(artists[0]).to.eq('Axwell/\\Ingrosso');
  });
  it('should parse song name', function() {
    const name = parseName('Jupiter #bpmDebut');
    expect(name).to.eq('Jupiter');
  });
  it('should get update from channel', async function() {
    const scope = nock('https://www.siriusxm.com')
      .get(/thebeat/)
      .reply(200, channelMetadataResponse);
    const res = await checkEndpoint(bpm);
    scope.done();
    expect(res).to.eq(true);
  });
  it('should skip song that has already been recorded', async function() {
    const scope = nock('https://www.siriusxm.com')
      .get(/thebeat/)
      .times(2)
      .reply(200, channelMetadataResponse1);
    const res = await checkEndpoint(bpm);
    const res2 = await checkEndpoint(bpm);
    scope.done();
    expect(res).to.eq(true);
    expect(res2).to.eq(false);
  });
  it('should skip invalid id', async function() {
    const scope = nock('https://www.siriusxm.com')
      .get(/thebeat/)
      .reply(200, channelMetadataInvalidId);
    const res = await checkEndpoint(bpm);
    scope.done();
    expect(res).to.eq(false);
  });
});
