const lint = require('mocha-eslint');

const mongo = require('../src/mongo');

lint(['src', 'test'], {
  formatter: 'node_modules/eslint-formatter-pretty',
  timeout: 20000,
});

after(async function flush() {
  const db = await mongo;
  db.dropDatabase();
});
