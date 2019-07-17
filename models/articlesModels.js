const connection = require('../db/connection.js');

exports.selectArticle = ({ article_id }) => {
  return connection('articles')
    .select('articles.*')
    .count('comment_id as comment_count')
    .leftJoin('comments', 'articles.article_id', 'comments.article_id')
    .where('articles.article_id', article_id)
    .groupBy('articles.article_id')
    .then(rows => {
      if (!rows.length) return Promise.reject({ status: 404, message: 'article not found' });
      else {
        return rows[0];
      }
    })
}

exports.updateArticle = ({ article_id }, { inc_votes }) => {
  if (!inc_votes) return Promise.reject({status: 400, message: 'invalid request'});
  else {
    return connection('articles')
      .where({ article_id })
      .increment('votes', inc_votes || 0)
      .returning('*')
      .then(article => {
        if (!article.length) return Promise.reject({status: 404, message: 'article not found'});
        return article[0];
      })
  }
}
