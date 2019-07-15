const {
  topicData,
  articleData,
  commentData,
  userData,
} = require('../data/index.js');

const { formatDates, formatComments, makeRefObj } = require('../utils/utils');

exports.seed = function (connection) {
  return connection
    .migrate
    .rollback()
    .then(() => {
      return connection
        .migrate
        .latest()
        .then(() => {
          const topicsInsertions = connection('topics').insert(topicData);
          const usersInsertions = connection('users').insert(userData);
          return Promise.all([topicsInsertions, usersInsertions])
            .then(() => {
              const formattedArticleData = formatDates(articleData);
              return connection('articles')
                .insert(formattedArticleData)
                .returning('*')
            })
            .then(articleRows => {
              const articleRef = makeRefObj(articleRows, 'title', 'article_id');
              const formattedComments = formatComments(commentData, articleRef);
              return connection('comments')
                .insert(formattedComments)
                .returning('*')
            });
        })
    });
};
