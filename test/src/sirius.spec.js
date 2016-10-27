const expect = require('chai').expect;
const nock = require('nock');
const _ = require('lodash');

const sirius = require('../../src/sirius');
const channels = require('../../src/channels');
const channelMetadataInvalidId = require('../mock/channelMetadataInvalidId');
const channelMetadataResponse = require('../mock/channelMetadataResponse');
const channelMetadataResponse1 = require('../mock/channelMetadataResponse1');

const bpm = _.find(channels, { id: 'thebeat' });

describe('SIRIUS', function () {
  it('should parse metadata response', function () {
    const stream = sirius.parseChannelMetadataResponse(channelMetadataResponse);
    expect(stream.name).to.eq('Closer (R3HAB Mix)');
    expect(stream.songId).to.eq('$O1FhQ');
    expect(stream.channelNumber).to.eq(51);
    expect(stream.channelName).to.eq('BPM');
    expect(stream.channelId).to.eq('thebeat');
    expect(stream.artists.length).to.eq(2);
    expect(stream.artistsId).to.eq('FQv');
  });
  it('should parse artists', function () {
    const artists = sirius.parseArtists('Axwell/\\Ingrosso/Adventure Club vs. DallasK');
    expect(artists.length).to.eq(2);
    expect(artists[0]).to.eq('Axwell/\\Ingrosso');
  });
  it('should get update from channel', async function () {
    const scope = nock('http://www.siriusxm.com')
      .get(/thebeat/)
      .reply(200, channelMetadataResponse);
    const res = await sirius.checkEndpoint(bpm);
    scope.done();
    expect(res).to.eq(true);
  });
  it('should skip song that has already been recorded', async function () {
    const scope = nock('http://www.siriusxm.com')
      .get(/thebeat/)
      .times(2)
      .reply(200, channelMetadataResponse1);
    const res = await sirius.checkEndpoint(bpm);
    const res2 = await sirius.checkEndpoint(bpm);
    scope.done();
    expect(res).to.eq(true);
    expect(res2).to.eq(false);
  });
});
