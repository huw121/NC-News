const ENV = process.env.NODE_ENV || 'development';
const dbConfig =
  ENV === 'production'
    ? { client: 'pg', connection: process.env.DATABASE_URL }
    : require('../knexfile.js');

    const connection = require('knex')(dbConfig);

module.exports = connection;
