const { selectArticle, updateArticle } = require('../models/articlesModels.js')

exports.getArticlesById = (req, res, next) => {
  selectArticle(req.params)
    .then(article => {
      res.status(200).send({ article });
    })
    .catch(next);
}

exports.patchArticleById = (req, res, next) => {
  updateArticle(req.params, req.body)
    .then(article => {
      res.status(201).send({ article });
    })
    .catch(next);
}