import { expect } from 'chai';

import * as Util from '../src/util';

describe('Util', function() {
  it('should clean ft', function() {
    expect(Util.cleanFt('Take You There(feat.Jamie Principle)')).to.eq('Take You There( Jamie Principle)');
    expect(Util.cleanFt('Talk About Me (Feat. Victoria Zaro)')).to.eq('Talk About Me ( . Victoria Zaro)');
    expect(Util.cleanFt('Another Life (f.Ester Dean)')).to.eq('Another Life (Ester Dean)');
    expect(Util.cleanFt('I Need You (f/Fernando Garibay)')).to.eq('I Need You ( Fernando Garibay)');
    expect(Util.cleanFt('The Right Song (feat. Natalie La Ro')).to.eq('The Right Song ( . Natalie La Ro');
    expect(Util.cleanFt('The Right Song (w/Natalie La Ro')).to.eq('The Right Song ( Natalie La Ro');
    expect(Util.cleanFt('Your Love feat Jamie Lewis')).to.eq('Your Love  Jamie Lewis');
    expect(Util.cleanFt('Morning After Dark')).to.eq('Morning After Dark');
    expect(Util.cleanFt('Robin Thicke ft T.I. & Pharrell')).to.eq('Robin Thicke   T.I. & Pharrell');
  });
  it('should clean clean Music Video', function() {
    expect(Util.cleanMusicVideo('Song (official video) ft. Natalie')).to.eq('Song () ft. Natalie');
    expect(Util.cleanMusicVideo('Robin Schulz (Official)')).to.eq('Robin Schulz ');
    expect(Util.cleanMusicVideo('Robin Schulz Lyrics')).to.eq('Robin Schulz ');
  });
  it('should clean clean', function() {
    expect(Util.cleanClean('Swish Swish (Clean)')).to.eq('Swish Swish ');
  });
  it('should collapse', function() {
    expect(Util.cleanSpaces('Song blah  blah   blah')).to.eq('Song blah blah blah');
  });
  it('should clean remix', function() {
    expect(Util.cleanRemix('Young (Gil Glaze Remix)')).to.eq('Young (Gil Glaze )');
    expect(Util.cleanRemix('Animals-Botnek Edit')).to.eq('Animals-Botnek ');
    expect(Util.cleanRemix('Don\'t Kill My Vibe (Gryffin Remix)')).to.eq('Don\'t Kill My Vibe (Gryffin )');
    expect(Util.cleanRemix('False Alarm-Hook N Sling Mix')).to.eq('False Alarm-Hook N Sling ');
    expect(Util.cleanRemix('Closer (R3HAB Mix)')).to.eq('Closer (R3HAB )');
  });
  it('should clean cut off end words', function() {
    expect(Util.cleanCutoff('Something Just Like This-Alesso Rem')).to.eq('Something Just Like This-Alesso');
    expect(Util.cleanCutoff('one two three')).to.eq('one two three');
  });
  it('should clean up garbage', function() {
    expect(Util.cleanupExtra('Something Just Like This-Alesso Rem')).to.eq('Something Just Like This Alesso Rem');
  });
  it('should clean up year', function() {
    expect(Util.cleanYear('Gimme Shelter (69)')).to.eq('Gimme Shelter ');
    expect(Util.cleanYear('Hello, I Love You (68)')).to.eq('Hello, I Love You ');
    expect(Util.cleanYear('The Creator (\'92)')).to.eq('The Creator ');
    expect(Util.cleanYear('Another Life (f.Ester Dean)')).to.eq('Another Life (f.Ester Dean)');
  });
});
