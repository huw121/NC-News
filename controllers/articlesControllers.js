const { selectArticle, updateArticle, selectAllArticles } = require('../models/articlesModels.js')

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
      res.status(200).send({ article });
    })
    .catch(next);
}

exports.getAllArticles = (req, res, next) => {
  selectAllArticles(req.query)
    .then(articles => {
      res.status(200).send({ articles })
    })
    .catch(next);
}
