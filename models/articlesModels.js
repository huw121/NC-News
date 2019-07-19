const connection = require('../db/connection.js');
const { rowCount, doesRowExistInTable } = require('./utils/utils.js');

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
  if (!inc_votes) return Promise.reject({ status: 400, message: 'invalid request: inc_votes not found' });
  else {
    return connection('articles')
      .where({ article_id })
      .increment('votes', inc_votes || 0)
      .returning('*')
      .then(article => {
        if (!article.length) return Promise.reject({ status: 404, message: 'article not found' });
        return article[0];
      })
  }
}

exports.selectAllArticles = ({ sort_by = 'created_at', order = 'desc', author, topic, limit = 10, p = 1 }) => {
  if (limit && !Number(limit)) return Promise.reject({ status: 400, message: 'INVALID LIMIT VALUE' });
  if (p && !Number(p)) return Promise.reject({ status: 400, message: 'INVALID PAGE NUMBER' });
  if (order !== 'asc' && order !== 'desc') return Promise.reject({ status: 400, message: 'invalid query' })
  return connection('articles')
    .select(
      'articles.author',
      'title',
      'articles.article_id',
      'topic',
      'articles.created_at',
      'articles.votes',
    )
    .count('comment_id as comment_count')
    .leftJoin('comments', 'articles.article_id', 'comments.article_id')
    .groupBy('articles.article_id')
    .orderBy(sort_by, order)
    .modify((query) => {
      if (author) query.where('articles.author', author);
      if (topic) query.where({ topic });
    })
    .limit(limit)
    .offset((p - 1) * limit)
    .then(articles => {
      let check = true;
      if (!articles.length) {
        if (author) check = doesRowExistInTable('users', 'username', author);
        if (topic) check = doesRowExistInTable('topics', 'slug', topic);
      }
      const totalCount = rowCount('articles', author, topic);
      return Promise.all([check, articles, totalCount]);
    })
    .then(([check, articles, totalCount]) => {
      return check
        ? [articles, totalCount]
        : Promise.reject({ status: 404, message: 'not found' });
    })
}

exports.delArticle = ({ article_id }) => {
  return connection('articles')
    .where({ article_id })
    .del()
    .then(delCount => {
      if (!delCount) return Promise.reject({ status: 404, message: 'article not found' });
      return delCount;
    })
}

exports.insertArticle = ({title, body, topic, author}) => {
  return connection('articles')
    .insert({title, body, topic, author})
    .returning('*')
    .then(article => article[0])
}
