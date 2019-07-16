const articlesRouter = require('express').Router();
const { getArticlesById, patchArticleById } = require('../controllers/articlesControllers.js');

articlesRouter.route('/:article_id')
  .get(getArticlesById)
  .patch(patchArticleById);

module.exports = articlesRouter;
