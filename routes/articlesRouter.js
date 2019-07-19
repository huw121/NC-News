const articlesRouter = require('express').Router();
const { getArticlesById, patchArticleById, getAllArticles, deleteArticleById } = require('../controllers/articlesControllers.js');
const { methodsErrors } = require('../errors/errors.js');
const { postComment, getComments } = require('../controllers/commentsControllers');

articlesRouter.route('/')
  .get(getAllArticles)
  .all(methodsErrors);

articlesRouter.route('/:article_id/comments')
  .post(postComment)
  .get(getComments)
  .all(methodsErrors);

articlesRouter.route('/:article_id')
  .get(getArticlesById)
  .patch(patchArticleById)
  .delete(deleteArticleById)
  .all(methodsErrors);


module.exports = articlesRouter;
