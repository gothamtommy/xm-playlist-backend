const rp = require('request-promise-native');


rp('https://api.spotify.com/v1/search?q=artist:Justin Bieber+Major Lazer+MO+track:Cold Water-Lost Frequencies Remix&type=track')
  .then((data) => {
    console.log(data);
  }, (err) => {
    console.error(err);
  });
