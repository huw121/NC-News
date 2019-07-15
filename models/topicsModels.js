const connection = require('../db/connection.js');

exports.selectAllTopics = () => {
  return connection('topics')
    .select('*');
}