const connection = require('../db/connection.js');

exports.insertComment = ({ article_id }, { username, body }) => {
  return connection('comments')
    .insert({ article_id, author: username, body })
    .returning('*')
    .then(comment => {
      return comment[0];
    })
}

exports.selectAllComments = ({ article_id }) => {
  return connection('comments')
    .select('votes', 'author', 'created_at', 'comment_id', 'body');
}
