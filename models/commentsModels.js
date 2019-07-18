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
      let articleCheck = true;
      if (!comments.length) {
        articleCheck = doesRowExistInTable('articles', 'article_id', article_id);
      }
      return Promise.all([articleCheck, comments]);
    })
    .then(([articleCheck, comments]) => {
      return articleCheck
        ? comments
        : Promise.reject({ status: 404, message: 'article_id not found' });
    })
}

exports.updateComment = ({ comment_id }, { inc_votes }) => {
  if (!inc_votes) return Promise.reject({ status: 400, message: 'invalid request: inc_votes not found' });
  return connection('comments')
    .where({ comment_id })
    .increment('votes', inc_votes || 0)
    .returning('*')
    .then(comment => {
      if (!comment.length) return Promise.reject({ status: 404, message: 'comment not found' })
      return comment[0];
    })
}

exports.delComment = ({ comment_id }) => {
  return connection('comments')
    .where({ comment_id })
    .del()
    .then(delCount => {
      if (!delCount) return Promise.reject({ status: 404, message: 'comment not found' });
      return delCount;
    })
}

const doesRowExistInTable = (table, identifierColumn, identifierRow) => {
  return connection(table)
    .select('*')
    .where(identifierColumn, identifierRow)
    .then(array => {
      return array.length !== 0;
    })
}

exports.doesRowExistInTable = doesRowExistInTable;
