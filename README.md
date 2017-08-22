# xm-playlist-backend
backend for https://xmplaylist.com Scans sirius endpoints and does a best effort to match songs on spotify. Adds those songs to playlists.

[![build status](https://img.shields.io/travis/scttcper/xm-playlist-backend.svg)](https://travis-ci.org/scttcper/xm-playlist-backend)
[![coverage status](https://codecov.io/gh/scttcper/xm-playlist-backend/branch/master/graph/badge.svg)](https://codecov.io/gh/scttcper/xm-playlist-backend)

### Requirements
- node > v8
- postgres
- `npm install`
- setup config/config.env.ts
- run `npm run setupdb` to setup tables

##### example config
```typescript
module.exports = {
  username: '',
  database: 'xm',
  password: '',
  db: {
    host: 'localhost',
    dialect: 'postgres',
    pool: {
      max: 5,
      min: 0,
      idle: 1000,
    },
  },
  port: 5000,
  dsn: false,
  spotifyUsername: 'email@gmail.com',
  spotifyPassword: 'password',
  spotifyClientId: 'clientId',
  spotifyClientSecret: 'clientPassword',
  location: 'http://localhost:5000',
  googleCredentials: 'credentials',
};
```

### Run
server
```
npm start
```
sirius xm scanner
```
npm run scanner
```
