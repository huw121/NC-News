const articlesRouter = require('express').Router();
const {getArticlesById} = require('../controllers/articlesControllers.js');

articlesRouter.route('/:article_id').get(getArticlesById);

module.exports = articlesRouter;
