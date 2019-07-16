const articlesRouter = require('express').Router();
const { getArticlesById, patchArticleById } = require('../controllers/articlesControllers.js');
const { methodsErrors } = require('../errors/errors.js');
const { postComment } = require('../controllers/commentsControllers');

articlesRouter.route('/:article_id/comments')
  .post(postComment);

articlesRouter.route('/:article_id')
  .get(getArticlesById)
  .patch(patchArticleById)
  .all(methodsErrors);


module.exports = articlesRouter;
