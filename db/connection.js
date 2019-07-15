const dbConfig = require('../knexfile.js');

const connection = require('knex')(dbConfig);

module.exports = connection;
