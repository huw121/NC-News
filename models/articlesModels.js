const connection = require('../db/connection.js');

exports.selectArticle = ({ article_id }) => {
  return connection('articles')
    .select('articles.*', 'comment_id')
    .leftJoin('comments', 'articles.article_id', 'comments.article_id')
    .where('articles.article_id', article_id)
    .then(rows => {
      if (!rows.length) return Promise.reject({ status: 404, message: 'article not found' });
      else {
        rows[0].comment_count = rows[0].comment_id ? rows.length : 0;
        delete rows[0].comment_id;
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
