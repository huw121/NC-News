const connection = require('../db/connection.js');

exports.insertComment = ({ article_id }, { username, body }) => {
  return connection('comments')
    .insert({ article_id, author: username, body })
    .returning('*')
    .then(comment => {
      return comment[0];
    })
}

exports.selectAllComments = ({ article_id }, { sort_by = 'created_at', order = 'desc' }) => {
  if (order !== 'desc' && order !== 'asc') return Promise.reject({ status: 400, message: 'invalid query' })
  return connection('comments')
    .select('votes', 'author', 'created_at', 'comment_id', 'body')
    .where({ article_id })
    .orderBy(sort_by, order)
    .then(comments => {
      if (!comments.length) return Promise.reject({ status: 404, message: 'not found' });
      else return comments;
    })
}
