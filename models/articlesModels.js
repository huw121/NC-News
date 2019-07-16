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