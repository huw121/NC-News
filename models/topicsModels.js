const connection = require('../db/connection.js');

exports.selectAllTopics = () => {
  return connection('topics')
    .select('*');
}

exports.insertTopic = ({ slug, description }) => {
  return connection('topics')
    .insert({ slug, description })
    .returning('*')
    .then(topic => topic[0]);
}
