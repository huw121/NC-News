const articlesRouter = require('express').Router();
const { getArticlesById, patchArticleById } = require('../controllers/articlesControllers.js');
const { methodsErrors } = require('../errors/errors.js');

articlesRouter.route('/:article_id')
  .get(getArticlesById)
  .patch(patchArticleById)
  .all(methodsErrors)

module.exports = articlesRouter;
