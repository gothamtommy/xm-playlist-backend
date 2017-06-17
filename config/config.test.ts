module.exports = {
  username: '',
  database: 'xm',
  password: '',
  db: {
    host: 'localhost',
    dialect: 'postgres',
    pool: {
      max: 5,
      min: 1,
      idle: 1000,
      logging: false,
    },
  },
  port: 5000,
  dsn: false,
  spotifyClientId: '',
  spotifyClientSecret: '',
};
